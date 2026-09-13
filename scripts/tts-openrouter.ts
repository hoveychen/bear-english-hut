/**
 * OpenRouter 的 TTS 后端。
 *
 * 用 `openai/gpt-audio-mini` 走 chat completions 的音频输出。它不是一个
 * 传统的 TTS 端点，而是一个**会说话的聊天模型**——这带来一个好处和一个风险：
 *
 *   好处：可以用系统提示词指定"念给一个五岁孩子听"的语气，
 *         而且能按每句台词在故事里的角色分别指定（见 ROLE_TONE）。
 *   风险：聊天模型有时会**回答**这句话而不是**念**它。
 *         "We need an umbrella because it is raining." 有可能被念成
 *         "Yes, you're right, you should bring an umbrella!"——
 *         听起来通顺，但那不是小熊该说的台词。
 *
 * 所以每一句都要拿返回的 transcript 与原文逐字核对，对不上就重试，
 * 重试还不行就报错退出。这个校验不是保险，是这条路能不能用的前提。
 */

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

/** OpenAI 音频模型可用的音色。 */
export const VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'] as const
export type Voice = (typeof VOICES)[number]

/**
 * 默认用 `full`，不是 mini —— 这一条与直觉相反，所以记下实测数据。
 *
 * 同一句 "Why do we need an umbrella?"（5 个词）：
 *
 *   openai/gpt-audio        72 个 completion token    $0.0041
 *   openai/gpt-audio-mini   16384 个（撞上限）        $0.0394   ← 贵 10 倍
 *
 * mini 在这套提示词下会**失控**：为一句短台词生成满上限的音频 token。
 * 便宜的单价乘以跑飞的用量，结果比 full 还贵，而且产出是几十秒的垃圾音频。
 * mini 保留在这里只为留个对照，默认别用。
 */
export const MODELS = {
  full: 'openai/gpt-audio',
  mini: 'openai/gpt-audio-mini',
} as const

/**
 * 单次请求的 token 上限。
 *
 * 这是上面那次跑飞的安全网：正常一句台词只要几十到几百个音频 token，
 * 封在 2048 既够长句用，又能让失控请求在烧掉四毛钱之前停下。
 */
const MAX_TOKENS = 2048

/**
 * 取 API key。优先环境变量，其次 dsh 的凭据文件。
 * 刻意不写死路径以外的任何东西，也绝不把 key 打进日志。
 */
export function readApiKey(): string {
  const fromEnv = process.env.OPENROUTER_API_KEY
  if (fromEnv) return fromEnv

  const credPath = path.join(os.homedir(), '.dsh', '.credentials.yaml')
  if (fs.existsSync(credPath)) {
    const m = fs.readFileSync(credPath, 'utf8').match(/^\s*OPENROUTER_API_KEY:\s*(\S+)\s*$/m)
    if (m?.[1]) return m[1]
  }

  throw new Error(
    '找不到 OPENROUTER_API_KEY。设进环境变量，或写在 ~/.dsh/.credentials.yaml 的 refs 下。',
  )
}

/**
 * 提示词结构。这两段是实测挑出来的，不要凭直觉改。
 *
 * 拿 6 句最难的台词（全是问句）对比过三种写法：
 *
 *   直接把台词丢给模型、让它"照读"            1/6
 *   把台词包进 <line> 标签、强调"不是在问你"   0/6  ← 更差
 *   **把 user 轮写成"给台本配音"的指令**       6/6  ← 现在用的
 *
 * 差别在于 user 轮**是什么**：前两种里，"Why do we need an umbrella?" 仍然处在
 * 对话中"轮到你说话"的位置，模型就会去回答它；第三种里 user 轮是一条配音指令，
 * 台词只是指令的素材，于是它被当作要念的字，而不是要答的话。
 */
export function systemPrompt(tone: string): string {
  return [
    'You are the voice of a friendly cartoon bear in a storybook app.',
    'The listener is a five-year-old who is learning English as a second language.',
    'You are a text-to-speech engine: you only ever voice the script given to you.',
    'Pronounce clearly and a little slower than adult conversation, with natural sentence rhythm —',
    'not word-by-word robotic.',
    `Delivery for this line: ${tone}`,
  ].join(' ')
}

/** user 轮必须是一条**配音指令**，台词只是它的素材。见 systemPrompt 的实测记录。 */
export function userPrompt(text: string): string {
  return `Voice this line of the bear's script verbatim, adding nothing:\n\n<line>${text}</line>`
}

/** 比对时的归一化：忽略大小写、标点和空白差异，只看词。 */
function normalizeForCompare(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type SynthResult = {
  /** 转好的音频字节（mp3） */
  mp3: Buffer
  /** 模型回报的朗读文本，已与原文核对一致 */
  transcript: string
  costUsd: number
}

type StreamOut = { pcm: Buffer; transcript: string; costUsd: number }

async function requestAudio(
  apiKey: string,
  model: string,
  voice: Voice,
  tone: string,
  text: string,
): Promise<StreamOut> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model,
      modalities: ['text', 'audio'],
      // 流式只支持 pcm16（mp3 会被拒），所以拿裸 PCM 回来自己转码
      audio: { voice, format: 'pcm16' },
      stream: true,
      // 温度拉到 0：我们要的是复读，不是创作
      temperature: 0,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt(tone) },
        { role: 'user', content: userPrompt(text) },
      ],
    }),
  })

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`)
  }

  const chunks: string[] = []
  const transcript: string[] = []
  let costUsd = 0

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffered = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffered += decoder.decode(value, { stream: true })

    // SSE 以空行分事件；最后一段可能不完整，留到下一轮
    const parts = buffered.split('\n')
    buffered = parts.pop() ?? ''
    for (const raw of parts) {
      const lineStr = raw.trim()
      if (!lineStr.startsWith('data:')) continue
      const payload = lineStr.slice(5).trim()
      if (payload === '[DONE]') continue
      let ev: any
      try {
        ev = JSON.parse(payload)
      } catch {
        continue
      }
      if (ev?.usage?.cost) costUsd = ev.usage.cost
      for (const choice of ev?.choices ?? []) {
        const audio = choice?.delta?.audio
        if (audio?.data) chunks.push(audio.data)
        if (audio?.transcript) transcript.push(audio.transcript)
      }
    }
  }

  if (chunks.length === 0) throw new Error('返回里没有音频数据')

  return {
    pcm: Buffer.from(chunks.join(''), 'base64'),
    transcript: transcript.join(''),
    costUsd,
  }
}

async function pcmToMp3(pcm: Buffer): Promise<Buffer> {
  const tmpIn = path.join(os.tmpdir(), `bear-tts-${process.pid}-${Math.random().toString(36).slice(2)}.pcm`)
  const tmpOut = `${tmpIn}.mp3`
  try {
    fs.writeFileSync(tmpIn, pcm)
    await run('ffmpeg', [
      '-y', '-loglevel', 'error',
      // 模型输出固定 24kHz 单声道 PCM16
      '-f', 's16le', '-ar', '24000', '-ac', '1',
      '-i', tmpIn,
      '-codec:a', 'libmp3lame', '-q:a', '3',
      tmpOut,
    ])
    return fs.readFileSync(tmpOut)
  } finally {
    fs.rmSync(tmpIn, { force: true })
    fs.rmSync(tmpOut, { force: true })
  }
}

/** 24kHz、单声道、16bit —— 模型输出的固定格式。用来由字节数反推时长。 */
const PCM_BYTES_PER_SECOND = 24000 * 2

/**
 * 时长合理性检查。
 *
 * transcript 对得上**不代表**音频是对的：那次跑飞里模型回报的文本是对的，
 * 音频却有满满 16384 个 token。文本核对看不出这种错，只有时长能。
 *
 * 上限放得很宽（每词 1.2 秒 + 4 秒余量），只拦真正离谱的情况——
 * 目的是抓跑飞，不是管朗读快慢。
 */
function checkDuration(text: string, pcmBytes: number): string | null {
  const words = text.trim().split(/\s+/).length
  const seconds = pcmBytes / PCM_BYTES_PER_SECOND
  const max = words * 1.2 + 4
  const min = Math.max(0.25, words * 0.12)
  if (seconds > max) return `音频过长：${words} 个词却有 ${seconds.toFixed(1)} 秒（上限 ${max.toFixed(1)} 秒），多半是模型跑飞了`
  if (seconds < min) return `音频过短：${words} 个词只有 ${seconds.toFixed(1)} 秒，可能被截断`
  return null
}

export type SynthOptions = {
  apiKey: string
  model: string
  voice: Voice
  tone: string
  /** 逐字核对失败时最多重试几次 */
  retries?: number
}

/**
 * 合成一句，并**保证念的就是原文**。
 *
 * 核对失败会重试；重试用完仍不一致就抛错，而不是把一句"模型自己编的话"
 * 悄悄写进 public/audio/ —— 那种错误在浏览器里听起来完全正常，
 * 只有对着台词表一句句听才能发现。
 */
export async function synthesize(text: string, opts: SynthOptions): Promise<SynthResult> {
  const { apiKey, model, voice, tone, retries = 2 } = opts
  const want = normalizeForCompare(text)
  let lastProblem = ''
  let spent = 0

  for (let attempt = 0; attempt <= retries; attempt++) {
    const out = await requestAudio(apiKey, model, voice, tone, text)
    spent += out.costUsd

    // 两道闸都要过：念的字对，且音频长度合理
    if (normalizeForCompare(out.transcript) !== want) {
      // 不接受"差不多"——台词就是台词
      lastProblem = `朗读与原文不符\n    应念：${text}\n    实念：${out.transcript}`
      continue
    }
    const durationProblem = checkDuration(text, out.pcm.length)
    if (durationProblem) {
      lastProblem = `${durationProblem}\n    台词：${text}`
      continue
    }

    return { mp3: await pcmToMp3(out.pcm), transcript: out.transcript, costUsd: spent }
  }

  throw new Error(`重试 ${retries} 次后仍不合格：${lastProblem}`)
}

export async function hasFfmpeg(): Promise<boolean> {
  try {
    await run('ffmpeg', ['-version'])
    return true
  } catch {
    return false
  }
}
