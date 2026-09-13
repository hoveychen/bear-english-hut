/**
 * 台词清册：把内容层里每一句会被念出来的英文抽出来。
 *
 * `scripts/extract-lines.ts`（生成录音脚本）和 `scripts/verify-audio.ts`
 * （校验覆盖率）都从这里取数据，保证两边看到的是同一份台词表——
 * 否则清单和校验各走各的，录完才发现对不上。
 *
 * 直接 import 各场景文件而不是 `src/content/index.ts`：后者用了无扩展名导入，
 * Node 的 ESM 解析不认（只有 Vite 的 bundler 解析认）。
 */

import { picnic } from '../src/content/picnic.ts'
import { clothes } from '../src/content/clothes.ts'
import { ball } from '../src/content/ball.ts'
import type { FollowUp, Scene } from '../src/content/types.ts'

export const scenes: Scene[] = [picnic, clothes, ball]

/** 一句台词在故事里担任的角色。决定录音时的语气。 */
export type LineRole =
  | 'opening'
  | 'closing'
  | 'prompt'
  | 'teacherModel'
  | 'success'
  | 'support1'
  | 'support2'
  | 'starter'
  | 'fallback'

export const ROLE_LABEL: Record<LineRole, string> = {
  opening: '开场白',
  closing: '收尾白',
  prompt: '提问',
  teacherModel: '示范',
  success: '做到了',
  support1: '支架一·换个说法再问',
  support2: '支架二·引出句首',
  starter: '支架二·句首本身',
  fallback: '支架三·完整示范',
}

/**
 * 录音语气提示。
 *
 * 这一列是整份清单里最容易被当成装饰、实际上最要紧的东西：同一句
 * "Start like this." 用讲解的语气和用催促的语气念出来，对孩子是两件事。
 * 念稿的人看不到状态机，只能靠这一列知道此刻小熊是什么神色。
 */
export const ROLE_TONE: Record<LineRole, string> = {
  opening: '热情、邀请，像朋友来敲门',
  closing: '满足、由衷地谢谢她',
  prompt: '好奇、真的在问，不是考她',
  teacherModel: '放慢、清楚，示范给她听',
  success: '高兴但不夸张，别像游戏音效',
  support1: '耐心，换个说法再问一次，不能有一丝责备',
  support2: '像要一起说出来那样，带点引导',
  starter: '只念句首，尾音悬着等她接',
  fallback: '轻松地自己说完，不要有"你没说对"的意味',
}

export type LineOccurrence = {
  sceneId: string
  sceneTitle: string
  /** beat id；场景级的开场/收尾白为 null */
  beatId: string | null
  role: LineRole
  /** 追问嵌套深度，0 = beat 本身 */
  depth: number
}

export type AudioLine = {
  text: string
  /** 建议文件名（不含扩展名） */
  slug: string
  /** 这句话在故事里出现的所有位置 */
  occurrences: LineOccurrence[]
}

function slugify(text: string, taken: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 6)
      .join('-') || 'line'

  if (!taken.has(base)) {
    taken.add(base)
    return base
  }
  // 前六个词一样的两句话（"start like this" 之类）靠序号区分
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`
    if (!taken.has(candidate)) {
      taken.add(candidate)
      return candidate
    }
  }
}

/**
 * 抽取全部台词并**按文本去重**。
 *
 * 去重是有意的：同一句 "Start like this." 在三个场景里出现十几次，
 * 录十几遍既浪费录音时间，也会让孩子听到同一句话有十几种读法。
 * 一句话录一次，所有出现的地方共用。
 */
export function collectLines(): AudioLine[] {
  const byText = new Map<string, LineOccurrence[]>()

  const push = (text: string | undefined, where: LineOccurrence) => {
    const t = text?.trim()
    if (!t) return
    const list = byText.get(t)
    if (list) list.push(where)
    else byText.set(t, [where])
  }

  for (const scene of scenes) {
    const at = (beatId: string | null, role: LineRole, depth = 0): LineOccurrence => ({
      sceneId: scene.id,
      sceneTitle: scene.title,
      beatId,
      role,
      depth,
    })

    push(scene.openingLine, at(null, 'opening'))

    for (const beat of scene.beats) {
      push(beat.promptLine, at(beat.id, 'prompt'))
      push(beat.teacherModel, at(beat.id, 'teacherModel'))
      push(beat.successLine, at(beat.id, 'success'))
      push(beat.support.level1.line, at(beat.id, 'support1'))
      push(beat.support.level2.line, at(beat.id, 'support2'))
      push(beat.support.level2.starter, at(beat.id, 'starter'))
      push(beat.support.fallback.line, at(beat.id, 'fallback'))

      // 追问可以嵌套，所以顺着链一路走下去
      let fu: FollowUp | undefined = beat.followUp
      let depth = 1
      while (fu) {
        push(fu.line, at(beat.id, 'prompt', depth))
        push(fu.successLine, at(beat.id, 'success', depth))
        push(fu.support.level1.line, at(beat.id, 'support1', depth))
        push(fu.support.level2.line, at(beat.id, 'support2', depth))
        push(fu.support.level2.starter, at(beat.id, 'starter', depth))
        push(fu.support.fallback.line, at(beat.id, 'fallback', depth))
        fu = fu.followUp
        depth++
      }
    }

    push(scene.closingLine, at(null, 'closing'))
  }

  const taken = new Set<string>()
  return [...byText.entries()].map(([text, occurrences]) => ({
    text,
    slug: slugify(text, taken),
    occurrences,
  }))
}

/** 只在一个场景里出现的台词，按场景分组；跨场景复用的单独归一类。 */
export function groupLines(lines: AudioLine[]) {
  const shared: AudioLine[] = []
  const perScene = new Map<string, AudioLine[]>()

  for (const line of lines) {
    const sceneIds = new Set(line.occurrences.map((o) => o.sceneId))
    if (sceneIds.size > 1) {
      shared.push(line)
      continue
    }
    const id = [...sceneIds][0]!
    const list = perScene.get(id)
    if (list) list.push(line)
    else perScene.set(id, [line])
  }

  return { shared, perScene }
}
