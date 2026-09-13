import type { IntentLevel, SkillTag } from '../content/types'
import { loadProgress, type Attempt, type SceneRun } from './progress'
import { scenes } from '../content'

/**
 * 家长端的学习反馈（设计文档 §10）。
 *
 * 刻意**不生成**的东西：识别成功率、发音分数、正确率、和别的孩子的对比。
 * 产品里根本没有"错"这个状态，报告里自然也不该长出一个。
 *
 * 生成的是七项行为观察——它们和第一版验证指标（§13）是同一批东西，
 * 这样家长看到的和团队要验证的是一回事。
 */

export const SKILL_LABEL: Record<SkillTag, string> = {
  describe: '描述人物和物品',
  position: '描述位置',
  request: '提出请求',
  reason: '说明原因',
  sequence: '按顺序讲述',
  predict: '预测下一步',
  retell: '复述',
}

/** 每个能力对应的家庭复听句型。报告末尾的建议从这里取。 */
const SKILL_PATTERN: Record<SkillTag, string> = {
  describe: 'This one is too ... / I am going to wear ...',
  position: 'It is under / behind / in ...',
  request: "Let's take ... / Can I ... , please?",
  reason: 'because ...',
  sequence: 'First ... then ...',
  predict: 'Maybe ... / I think ...',
  retell: 'It was ... but now it is ...',
}

export type Observation = {
  key: string
  label: string
  /** 只决定图标与配色：yes = 好，partial = 居中，no = 待观察 */
  state: 'yes' | 'partial' | 'no'
  /**
   * 这一行的结论文字。
   *
   * 不能由 state 统一推出来，因为"是否需要支架"这一行的**极性是反的**：
   * 少用支架才是好。用同一套 yes→「做到了」的映射，会让"用了 4 次完整示范"
   * 显示成「本次未出现」，正好说反。
   */
  stateText: string
  detail: string
}

export type SceneReport = {
  sceneId: string
  sceneTitle: string
  finishedAt: number | null
  /** 本次完成的语言任务 */
  completedSkills: SkillTag[]
  /** 第一次问就说出目标表达的次数 */
  independent: number
  /** 借助句首（第二级支架）完成的次数 */
  withStarter: number
  /** 听完整示范才过的次数 */
  withFullModel: number
  /** 主动开口的次数（哪怕没说到目标表达，也算数） */
  spokeCount: number
  totalQuestions: number
  /** 本次说出的最长一句有几个英文词 */
  longestUtterance: number
  /** 达到完整句（target 及以上）的次数 */
  fullSentences: number
  observations: Observation[]
  /** 建议家庭复听的句型 */
  practice: string[]
}

function rank(level: IntentLevel | null): number {
  return level === 'challenge' ? 3 : level === 'target' ? 2 : level === 'basic' ? 1 : 0
}

/** 找到某个故事最近一次完整的记录。 */
export function latestRun(sceneId: string): SceneRun | null {
  const runs = loadProgress().runs.filter((r) => r.sceneId === sceneId && r.attempts.length > 0)
  return runs.at(-1) ?? null
}

/** 孩子在**别的**故事里是否也用过这个能力——用来判断"迁移"。 */
function skillsInOtherScenes(sceneId: string): Set<SkillTag> {
  const out = new Set<SkillTag>()
  for (const run of loadProgress().runs) {
    if (run.sceneId === sceneId) continue
    for (const a of run.attempts) if (a.level !== null) out.add(a.skill)
  }
  return out
}

export function buildSceneReport(sceneId: string): SceneReport | null {
  const run = latestRun(sceneId)
  if (!run) return null
  const scene = scenes.find((s) => s.id === sceneId)
  const attempts: Attempt[] = run.attempts

  const matched = attempts.filter((a) => a.level !== null)
  const independent = matched.filter((a) => a.supportUsed === 0).length
  const withStarter = matched.filter((a) => a.supportUsed === 2).length
  const withFullModel = attempts.filter((a) => a.supportUsed >= 3).length
  const spokeCount = attempts.filter((a) => a.spoke).length
  const fullSentences = attempts.filter((a) => rank(a.level) >= 2).length
  const longestUtterance = attempts.reduce((m, a) => Math.max(m, a.wordCount), 0)

  const completedSkills = [...new Set(matched.map((a) => a.skill))]
  const elsewhere = skillsInOtherScenes(sceneId)
  const transferred = completedSkills.filter((s) => elsewhere.has(s))

  // 需要复听的：本次完全没达到完整句、或靠完整示范才过的那些能力
  const weak = [
    ...new Set(
      attempts
        .filter((a) => rank(a.level) < 2 || a.supportUsed >= 2)
        .map((a) => a.skill),
    ),
  ]

  const core = completedSkills.filter((s) => s === 'position' || s === 'sequence' || s === 'reason')

  /** 正向行的统一说法：做到 / 在帮助下做到 / 本次未出现。 */
  const say = (state: Observation['state']) =>
    state === 'yes' ? '做到了' : state === 'partial' ? '在帮助下做到' : '本次未出现'

  const spokeState: Observation['state'] =
    spokeCount >= attempts.length * 0.7 ? 'yes' : spokeCount > 0 ? 'partial' : 'no'

  // matched 为 0 时必须是 no。写成 `independent + withStarter >= matched.length * 0.6`
  // 会在一次都没说出来时算出 0 >= 0 = true，报成「做到了」——正好把最需要
  // 家长注意的一次说成了最好的一次。
  const understandState: Observation['state'] =
    matched.length === 0 ? 'no' : independent + withStarter >= matched.length * 0.6 ? 'yes' : 'partial'

  const sentenceState: Observation['state'] = fullSentences >= 3 ? 'yes' : fullSentences > 0 ? 'partial' : 'no'
  const structureState: Observation['state'] = core.length >= 2 ? 'yes' : core.length === 1 ? 'partial' : 'no'
  const transferState: Observation['state'] =
    transferred.length >= 2 ? 'yes' : transferred.length === 1 ? 'partial' : 'no'
  const streakState: Observation['state'] = longestUtterance >= 10 ? 'yes' : longestUtterance >= 6 ? 'partial' : 'no'

  // 极性相反的一行：支架用得**少**才是好
  const supportState: Observation['state'] =
    withFullModel === 0 && withStarter === 0 ? 'yes' : withFullModel <= 1 ? 'partial' : 'no'

  const observations: Observation[] = [
    {
      key: 'spoke',
      label: '是否主动开口',
      state: spokeState,
      stateText: say(spokeState),
      detail: `${attempts.length} 次邀请里开口 ${spokeCount} 次`,
    },
    {
      key: 'understand',
      label: '是否能听懂任务',
      state: understandState,
      stateText: say(understandState),
      detail: matched.length > 0 ? `${matched.length} 次说出了目标表达` : '本次都借助了完整示范',
    },
    {
      key: 'sentence',
      label: '是否能用完整句回应',
      state: sentenceState,
      stateText: say(sentenceState),
      detail: `完整句 ${fullSentences} 次`,
    },
    {
      key: 'structure',
      label: '是否能描述位置、顺序和原因',
      state: structureState,
      stateText: say(structureState),
      detail: core.map((s) => SKILL_LABEL[s]).join('、') || '本次未出现',
    },
    {
      key: 'transfer',
      label: '是否能在新场景迁移表达',
      state: transferState,
      stateText: say(transferState),
      detail: transferred.length
        ? `${transferred.map((s) => SKILL_LABEL[s]).join('、')} 在别的故事里也用出来了`
        : '还需要更多故事来观察',
    },
    {
      key: 'support',
      label: '是否需要示范、句首或图片支架',
      state: supportState,
      stateText: supportState === 'yes' ? '这次没用上' : supportState === 'partial' ? '偶尔需要' : '这次比较依赖',
      detail: `句首支架 ${withStarter} 次，完整示范 ${withFullModel} 次`,
    },
    {
      key: 'streak',
      label: '是否能连续说两到四句',
      state: streakState,
      stateText: say(streakState),
      // 6 个英文词大致是一个完整句的长度；10 词以上基本是两句连说
      detail: longestUtterance > 0 ? `最长一次说了 ${longestUtterance} 个英文词` : '本次没有记录到英文表达',
    },
  ]

  return {
    sceneId,
    sceneTitle: scene?.title ?? sceneId,
    finishedAt: run.finishedAt,
    completedSkills,
    independent,
    withStarter,
    withFullModel,
    spokeCount,
    totalQuestions: attempts.length,
    longestUtterance,
    fullSentences,
    observations,
    practice: (weak.length ? weak : completedSkills).slice(0, 3).map((s) => SKILL_PATTERN[s]),
  }
}

/** 设计文档 §10 里那张"简短报告"的纯文本形态，方便家长直接转发。 */
export function reportAsText(r: SceneReport): string {
  return [
    `《${r.sceneTitle}》`,
    `本次完成：${r.completedSkills.map((s) => SKILL_LABEL[s]).join('、') || '—'}`,
    `独立表达：${r.independent} 次`,
    `借助句首完成：${r.withStarter} 次`,
    `听完整示范后继续：${r.withFullModel} 次`,
    `最长一次连说：${r.longestUtterance} 个英文词`,
    `建议家庭复听：${r.practice.join(' / ') || '—'}`,
  ].join('\n')
}
