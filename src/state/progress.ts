import type { IntentLevel, SkillTag } from '../content/types'
import type { StickerId } from '../components/HandDrawn'

/**
 * 进度与学习记录（设计文档 §10）。
 *
 * 记的是**语言任务**，不是识别成功率。所以每次开口都带上：用了第几级支架、
 * 达到了哪一档、说了几个词——家长端的每一条结论都从这三个字段推出来，
 * 没有"正确率"这种字段，因为产品里根本没有"错"这个状态。
 */

const KEY = 'bear-english-hut/progress/v1'
const MAX_RUNS = 24

export type Attempt = {
  sceneId: string
  beatId: string
  /** 追问是独立一问，所以 beat 与 followUp 各自记一条 */
  questionId: string
  skill: SkillTag
  /** 命中的最高档；null 表示这一问最终没说出可识别的目标表达 */
  level: IntentLevel | null
  /** 0 = 第一次问就说出来；1/2 = 用了第一/二级支架；3 = 听完整示范才过 */
  supportUsed: number
  /** 是否真的开口了（区别于沉默或直接点选） */
  spoke: boolean
  transcript: string
  wordCount: number
  at: number
}

export type SceneRun = {
  sceneId: string
  startedAt: number
  finishedAt: number | null
  attempts: Attempt[]
}

export type Progress = {
  version: 1
  stickers: StickerId[]
  runs: SceneRun[]
}

const EMPTY: Progress = { version: 1, stickers: [], runs: [] }

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Progress
    if (parsed?.version !== 1 || !Array.isArray(parsed.runs)) return EMPTY
    return parsed
  } catch {
    // 隐私模式 / 存储被禁用时照常玩，只是不留记录
    return EMPTY
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, runs: p.runs.slice(-MAX_RUNS) }))
  } catch {
    /* 存不下就算了，绝不影响故事进行 */
  }
}

export function startRun(sceneId: string): SceneRun {
  const p = loadProgress()
  const run: SceneRun = { sceneId, startedAt: Date.now(), finishedAt: null, attempts: [] }
  p.runs.push(run)
  save(p)
  return run
}

export function recordAttempt(attempt: Attempt) {
  const p = loadProgress()
  const run = p.runs[p.runs.length - 1]
  if (!run || run.sceneId !== attempt.sceneId || run.finishedAt !== null) {
    p.runs.push({ sceneId: attempt.sceneId, startedAt: Date.now(), finishedAt: null, attempts: [attempt] })
  } else {
    run.attempts.push(attempt)
  }
  save(p)
}

export function finishRun(sceneId: string, sticker: StickerId) {
  const p = loadProgress()
  const run = p.runs[p.runs.length - 1]
  if (run && run.sceneId === sceneId && run.finishedAt === null) run.finishedAt = Date.now()
  if (!p.stickers.includes(sticker)) p.stickers.push(sticker)
  save(p)
}

export function earnedStickers(): StickerId[] {
  return loadProgress().stickers
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}

export function countWords(transcript: string): number {
  // 中英混说时按空格切会低估中文部分，但报告关心的是**英文连续表达长度**，
  // 所以只数英文词元；中文字符不计入。
  const en = transcript.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)
  return en?.length ?? 0
}
