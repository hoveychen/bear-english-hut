/**
 * 批量生成台词音频（OpenRouter / gpt-audio）。
 *
 *   node scripts/generate-audio.ts                   # 生成还没有的
 *   node scripts/generate-audio.ts --voice coral     # 指定音色
 *   node scripts/generate-audio.ts --force           # 全部重生成
 *   node scripts/generate-audio.ts --only because    # 只生成含该子串的台词
 *   node scripts/generate-audio.ts --dry-run         # 只报要生成多少、预估多少钱
 *   node scripts/generate-audio.ts --model mini      # 对照用，别用：见 MODELS 的实测记录
 *
 * 为什么要预生成，而不是让浏览器自己念？因为浏览器 TTS 的音色**由用户设备决定**：
 * Mac 上是 Samantha、Windows 上是 Zira、安卓上又是别的，语速和断句都不一样。
 * 预生成把音色、语速、节奏钉死在构建产物里，孩子每次听到的小熊都是同一只；
 * 浏览器 TTS 退居兜底（漏了的句子、生成失败的句子照样有声音）。
 *
 * 每句台词按它在故事里的**角色**分配语气（提问要好奇、支架三不能有责备），
 * 语气表见 scripts/audio-lines.ts 的 ROLE_TONE。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectLines, ROLE_TONE, type AudioLine } from './audio-lines.ts'
import { hasFfmpeg, MODELS, readApiKey, synthesize, VOICES, type Voice } from './tts-openrouter.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'audio')
const manifestPath = path.join(outDir, 'manifest.json')

/* ── 参数 ─────────────────────────────────────────────── */

const argv = process.argv.slice(2)
const flag = (n: string) => argv.includes(`--${n}`)
const value = (n: string, fallback: string) => {
  const i = argv.indexOf(`--${n}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1]! : fallback
}

const VOICE = value('voice', 'coral') as Voice
const MODEL_KEY = value('model', 'full') as keyof typeof MODELS
const ONLY = value('only', '')
const FORCE = flag('force')
const DRY = flag('dry-run')
/** 并发。132 句串行要十几分钟；4 路并发既快又不至于撞限流。 */
const CONCURRENCY = Number(value('concurrency', '4'))

/**
 * 成本按**词数**估，不是按句数。
 *
 * 实测 openai/gpt-audio：5 词句 $0.0041，13 词句 $0.0092——大致 $0.0007/词
 * 加每次约 $0.0005 的固定开销。按句数平摊会让长句多的场景严重低估。
 */
const EST_USD_FIXED = 0.0005
const EST_USD_PER_WORD = 0.0007
const estimate = (lines: AudioLine[]) =>
  lines.reduce((sum, l) => sum + EST_USD_FIXED + l.text.trim().split(/\s+/).length * EST_USD_PER_WORD, 0)

function fail(msg: string): never {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

async function main() {
  if (!VOICES.includes(VOICE)) fail(`音色「${VOICE}」不在可选范围：${VOICES.join(' / ')}`)
  if (!MODELS[MODEL_KEY]) fail(`--model 只能是 ${Object.keys(MODELS).join(' 或 ')}`)
  if (!(await hasFfmpeg())) fail('需要 ffmpeg 把模型返回的 PCM 转成 mp3。brew install ffmpeg')

  const model = MODELS[MODEL_KEY]
  const apiKey = readApiKey()

  fs.mkdirSync(outDir, { recursive: true })
  const manifest: Record<string, string> = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : {}

  const all = collectLines()
  let lines = all
  if (ONLY) {
    lines = lines.filter((l) => l.text.toLowerCase().includes(ONLY.toLowerCase()))
    console.log(`--only "${ONLY}" → ${lines.length} 句`)
  }

  const todo = lines.filter((l) => {
    if (FORCE) return true
    const existing = manifest[l.text]
    return !(existing && fs.existsSync(path.join(outDir, existing)))
  })

  console.log(`模型 ${model}，音色 ${VOICE}，并发 ${CONCURRENCY}`)
  console.log(`待生成 ${todo.length} 句（已有 ${lines.length - todo.length} 句），预估约 $${estimate(todo).toFixed(2)}`)

  if (DRY) {
    console.log('\n--dry-run：没有真的调用。')
    return
  }
  if (todo.length === 0) {
    console.log('\n没有要生成的。加 --force 可全部重做。')
    return
  }

  let done = 0
  let spent = 0
  const failures: Array<{ line: AudioLine; error: string }> = []

  /** 简单的固定并发池，够用且不引依赖。 */
  const queue = [...todo]
  const worker = async () => {
    for (;;) {
      const line = queue.shift()
      if (!line) return
      // 同一句可能出现在多处，语气取第一处的角色——那是它的主要用途
      const tone = ROLE_TONE[line.occurrences[0]!.role]
      try {
        const { mp3, costUsd } = await synthesize(line.text, { apiKey, model, voice: VOICE, tone })
        const file = `${line.slug}.mp3`
        fs.writeFileSync(path.join(outDir, file), mp3)
        manifest[line.text] = file
        spent += costUsd
      } catch (e) {
        failures.push({ line, error: (e as Error).message })
      }
      done++
      process.stdout.write(`\r  ${done}/${todo.length}  $${spent.toFixed(4)}  ${failures.length ? `失败 ${failures.length}` : ''}   `)
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker))
  process.stdout.write('\n')

  /*
   * 台词改过之后，manifest 里会留下指向旧音频的陈旧条目。留着它们的后果是
   * 那几句永远播不到，而且不会报错——顺手扫掉，并删除对应的孤儿文件。
   */
  const wanted = new Set(all.map((l) => l.text))
  let dropped = 0
  for (const text of Object.keys(manifest)) {
    if (!wanted.has(text)) {
      fs.rmSync(path.join(outDir, manifest[text]!), { force: true })
      delete manifest[text]
      dropped++
    }
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  console.log(`✓ 生成 ${todo.length - failures.length} 句，花费 $${spent.toFixed(4)}，manifest 共 ${Object.keys(manifest).length} 条`)
  if (dropped) console.log(`  清掉 ${dropped} 个台词已变更的旧音频`)

  if (failures.length) {
    console.log(`\n✗ ${failures.length} 句没能生成：`)
    for (const f of failures.slice(0, 10)) {
      console.log(`  · ${f.line.slug}\n    ${f.error.split('\n').join('\n    ')}`)
    }
    if (failures.length > 10) console.log(`  … 还有 ${failures.length - 10} 条`)
    // 没生成的句子会自动走浏览器 TTS，故事照常能玩，所以这里不是致命错误。
    // 但退出码要非零，免得 CI 把"一半没生成"当成功。
    console.log('\n这些句子会回落到浏览器 TTS。重跑本命令只会补生成失败的部分。')
    process.exitCode = 1
  }

  console.log(`\n  跑 \`node scripts/verify-audio.ts\` 复核，或 \`pnpm dev\` 直接听。`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
