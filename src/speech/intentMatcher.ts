import type { Intent, IntentLevel } from '../content/types'

/**
 * 意图匹配（设计文档 §8.1）。
 *
 * 第一版**不做发音评分**。这里只回答一个问题：孩子刚才说的话，够不够推动故事？
 *
 * 明确接受：关键词、短句、轻微语法错误、口音导致的识别偏差、中英混说。
 * 明确不做：confidence 门限判定——识别器对儿童声音的置信度天然偏低，
 * 拿它当对错判据等于惩罚目标用户。confidence 只随结果带出去给家长端参考。
 */

export const LEVEL_RANK: Record<IntentLevel, number> = { basic: 1, target: 2, challenge: 3 }

/**
 * 归一化。关键词和识别结果走**同一个**函数，所以内容层可以照着自然拼写写
 * （"let's"、"it's"、"next to"），不用自己想着去掉撇号。
 */
export function normalize(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'") // 各种花体撇号统一
    .replace(/'/g, '') // it's → its，let's → lets
    // 只把标点换成空格。CJK 字符**保留**——中英混说时英文部分照样要能匹配。
    .replace(/[.,!?;:"“”()\[\]{}\-_/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return ` ${cleaned} `
}

/**
 * 一个词的形态宽容：复数、进行时、过去式，外加双写辅音（run → running）
 * 和 y→ies（try → tries）。5 岁孩子说 "raining" 而关键词写的是 "rain"，
 * 这是对的表达，不该判不匹配。
 */
function wordPattern(word: string): string {
  const w = escapeRegex(word)
  const last = word.at(-1) ?? ''
  const parts = [`${w}(?:s|es|ed|ing|er|est)?`]
  if (/[bdgklmnprtvz]/.test(last)) parts.push(`${w}${escapeRegex(last)}(?:ed|ing)`)
  if (last === 'y') parts.push(`${escapeRegex(word.slice(0, -1))}(?:ies|ied)`)
  if (last === 'e') parts.push(`${escapeRegex(word.slice(0, -1))}(?:ing|ed)`)
  return `(?:${parts.join('|')})`
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 把一个关键词（可能含 `|` 备选、可能是词组）编译成正则。 */
function compileTerm(term: string): RegExp {
  const alternatives = term
    .split('|')
    .map((s) => normalize(s).trim())
    .filter(Boolean)
    .map((phrase) => phrase.split(' ').map(wordPattern).join(' '))
  return new RegExp(`(?:^| )(?:${alternatives.join('|')})(?: |$)`)
}

const termCache = new Map<string, RegExp>()
function termRegex(term: string): RegExp {
  let re = termCache.get(term)
  if (!re) {
    re = compileTerm(term)
    termCache.set(term, re)
  }
  return re
}

/** 单个意图是否命中：外层任一组命中即可，组内所有词必须都出现。 */
export function matchesIntent(normalizedText: string, intent: Intent): boolean {
  return intent.keywords.some((group) => group.every((term) => termRegex(term).test(normalizedText)))
}

export type MatchResult = {
  /** 是否够推动故事（任意一档命中都算够） */
  matched: boolean
  /** 命中的最高档 */
  level: IntentLevel | null
  intentId: string | null
  /** 实际用于判定的那条候选（可能不是识别器的首选） */
  usedTranscript: string
}

/**
 * 在所有候选里找最好的一条。
 *
 * 为什么要遍历 alternatives：浏览器对儿童声音的首选经常是错的，
 * 而正确答案往往排在第二、第三条（`maxAlternatives = 3` 就是为此）。
 * 取"命中档位最高"的那条，等于把选择权交给内容层的语言目标，而不是识别器的排序。
 */
export function matchIntents(candidates: string[], intents: Intent[]): MatchResult {
  let best: MatchResult = { matched: false, level: null, intentId: null, usedTranscript: candidates[0] ?? '' }

  for (const candidate of candidates) {
    if (!candidate?.trim()) continue
    const text = normalize(candidate)
    for (const intent of intents) {
      if (!matchesIntent(text, intent)) continue
      const rank = LEVEL_RANK[intent.level]
      const bestRank = best.level ? LEVEL_RANK[best.level] : 0
      if (rank > bestRank) {
        best = { matched: true, level: intent.level, intentId: intent.id, usedTranscript: candidate }
      }
    }
  }
  return best
}

/**
 * 孩子说的话有没有实质内容。
 *
 * 用来区分"沉默"和"说了但没match"——两者该走不同的支架：
 * 沉默要先鼓励开口，说错了要先给示范。
 */
export function hasContent(transcript: string): boolean {
  const t = normalize(transcript).trim()
  if (!t) return false
  // 纯填充词不算说了话
  const fillers = new Set(['um', 'uh', 'er', 'hmm', 'mm', 'ah', 'oh', 'eh'])
  return t.split(' ').some((w) => w.length > 0 && !fillers.has(w))
}
