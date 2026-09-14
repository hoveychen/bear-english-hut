import type { BearAction, BearMood } from '../components/Bear'
import type { StickerId } from '../components/HandDrawn'

/**
 * 内容层类型（设计文档 §9）。
 *
 * 核心约束：语言目标**不写死在组件里**。场景组件只会读这里的声明，
 * 所以将来把浏览器识别换成云端识别时，故事和界面都不用重写。
 */

/** 家长端报告的语言能力标签（设计文档 §10 的观察项）。 */
export type SkillTag =
  | 'describe' // 描述人物、物品
  | 'position' // 描述位置（in / under / behind / next to）
  | 'request' // 提出请求
  | 'reason' // 说明原因
  | 'sequence' // 按顺序讲述（First ... then ...）
  | 'predict' // 预测下一步
  | 'retell' // 复述

/** 三个难度档（设计文档 §6）。系统不要求一次说到最高档。 */
export type IntentLevel = 'basic' | 'target' | 'challenge'

export type Intent = {
  id: string
  level: IntentLevel
  /**
   * 或-与 两层结构：外层任一组命中即算匹配，内层同组词必须全部出现。
   * 例：[['umbrella'], ['rain','need']] 表示"说了 umbrella"或"同时说了 rain 和 need"。
   * 每个词本身可以写成 'a|an' 这样的同义或形式变体。
   */
  keywords: string[][]
  /** 该档的完整示范句。用于支架播放和家长端报告。 */
  model: string
}

/** 舞台上的一个可操作对象。 */
export type SceneObject = {
  id: string
  /** src/assets/objects 下的文件名（不含扩展名），或 'drawn:blanket' 走手绘组件 */
  art: string
  /** 舞台坐标，百分比（相对舞台宽高） */
  x: number
  y: number
  scale?: number
  /** 这个物品是不是本节点的正确选择。干扰项传 false。 */
  correct?: boolean
  /** 初始隐藏，靠 reveal 效果出现（场景三找球用） */
  hidden?: boolean
}

/** 语言产生的场景变化。设计文档 §4：语言必须改变场景状态。 */
export type StageEffect =
  | { kind: 'collect'; objectId: string } // 物品飞进篮子
  | { kind: 'wear'; objectId: string } // 小熊穿上
  | { kind: 'hold'; objectId: string } // 小熊举起
  | { kind: 'reveal'; objectId: string } // 物品显形
  | { kind: 'remove'; objectId: string } // 物品离场
  | { kind: 'weather'; to: 'sun' | 'rain' | 'snow' } // 天气变化
  | { kind: 'backdrop'; to: BackdropId } // 换场景

export type BackdropId =
  | 'home'
  | 'kitchen'
  | 'meadow'
  | 'bedroom'
  | 'livingroom'
  | 'supermarket'
  | 'zoo'

/** 三级支架（设计文档 §6 状态机的 support_1 / support_2 / fallback）。 */
export type Support = {
  /** 第一级：换个说法重问，并让正确物品轻轻跳动。 */
  level1: { line: string; highlight?: string[] }
  /**
   * 第二级：给句首。设计文档 §7 明确"提示不通过文字提供"，
   * 所以 starter 是**播放出来**的音频，界面上只出现图片顺序卡。
   */
  level2: { line: string; starter: string; pictureCards?: string[] }
  /** 第三级：完整示范，并允许点击物品代替开口继续故事。 */
  fallback: { line: string; allowTapToContinue: true }
}

/** 达到基础档后的追问，把孩子从关键词往完整表达推一层。 */
export type FollowUp = {
  line: string
  mood?: BearMood
  targetIntents: Intent[]
  support: Support
  skill: SkillTag
  successLine: string
  /** 追问也可以再嵌一层（关键词 → 完整句 → 加原因） */
  followUp?: FollowUp
}

export type Beat = {
  id: string
  /** 小熊在本节点的神色与动作 */
  mood: BearMood
  characterAnimation: BearAction
  /** 小熊说的话（英文，走 TTS / 预录音） */
  promptLine: string
  /** 可选的教师示范，在 prompt 之后播一次（状态机的 teacher_model） */
  teacherModel?: string
  /** 本节点舞台上的物品 */
  objects: SceneObject[]
  /**
   * 要求孩子先点选物品再开口。给的是需要选中的数量；
   * 不传表示直接进入 listening。
   */
  requireSelection?: number
  targetIntents: Intent[]
  followUp?: FollowUp
  support: Support
  successLine: string
  successAnimation: BearAction
  effects?: StageEffect[]
  skill: SkillTag
}

export type Scene = {
  id: string
  /** 家长端可见的中文标题；孩子端只看封面画 */
  title: string
  subtitle: string
  backdrop: BackdropId
  weather?: 'sun' | 'rain' | 'snow'
  sticker: StickerId
  /** 故事开场白 */
  openingLine: string
  /** 故事收尾白 */
  closingLine: string
  beats: Beat[]
}
