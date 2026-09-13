import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { BackdropId, Beat, FollowUp, Intent, Scene, SkillTag, StageEffect, Support } from '../content/types'
import type { BearAction, BearMood } from '../components/Bear'
import { listenOnce, type ListenHandle, type ListenOutcome, isRecognitionSupported } from '../speech/recognition'
import { cancelSpeech, speak, unlockSpeech } from '../speech/synthesis'
import { hasContent, LEVEL_RANK, matchIntents } from '../speech/intentMatcher'
import { countWords, finishRun, recordAttempt, startRun } from './progress'

/**
 * 单个互动节点的状态机（设计文档 §6）：
 *
 *   scene_intro → teacher_model → child_observe → child_invite → listening
 *   → intent_match → success_or_followup → support_1 → support_2 → fallback → scene_continue
 *
 * 一条铁律贯穿全文件：**故事必须能继续**。识别失败、拒权、浏览器不支持、
 * 孩子一言不发——每一条路径最后都通向下一拍，没有死胡同，也没有红叉。
 */

export type Phase =
  | 'idle' // 等待开始（需要一次用户手势解锁音频）
  | 'intro' // 播故事开场白
  | 'prompt' // 小熊提问（含 teacher_model）
  | 'observe' // 等孩子点选物品
  | 'invite' // 邀请开口，麦克风开始召唤
  | 'listening' // 正在收听
  | 'thinking' // 判定中（极短，给一个视觉停顿）
  | 'success' // 说对了，播结果 + 场景变化
  | 'support' // 支架 1 / 2
  | 'fallback' // 完整示范，允许点击继续
  | 'scene-done' // 故事结束，进入贴纸仪式

/** 把 Beat 与 FollowUp 归一成"一问"，状态机只认这一种形状。 */
type Question = {
  id: string
  line: string
  teacherModel?: string
  mood: BearMood
  intents: Intent[]
  support: Support
  successLine: string
  skill: SkillTag
  followUp?: FollowUp
  /** 追问不再重复播 beat 的物品要求 */
  isFollowUp: boolean
}

function questionFromBeat(beat: Beat): Question {
  return {
    id: beat.id,
    line: beat.promptLine,
    teacherModel: beat.teacherModel,
    mood: beat.mood,
    intents: beat.targetIntents,
    support: beat.support,
    successLine: beat.successLine,
    skill: beat.skill,
    followUp: beat.followUp,
    isFollowUp: false,
  }
}

function questionFromFollowUp(beatId: string, fu: FollowUp, depth: number): Question {
  return {
    id: `${beatId}#fu${depth}`,
    line: fu.line,
    mood: fu.mood ?? 'waiting',
    intents: fu.targetIntents,
    support: fu.support,
    successLine: fu.successLine,
    skill: fu.skill,
    followUp: fu.followUp,
    isFollowUp: true,
  }
}

/** 舞台的可变状态——语言改变场景，改的就是它（设计文档 §4）。 */
export type StageState = {
  backdrop: BackdropId
  weather: 'sun' | 'rain' | 'snow' | null
  collected: string[]
  revealed: string[]
  removed: string[]
  wearing: string | null
  holding: string | null
}

export type MachineView = {
  phase: Phase
  beat: Beat | null
  beatIndex: number
  totalBeats: number
  question: Question | null
  /** 0 = 首问，1 = 支架一，2 = 支架二，3 = 完整示范 */
  attempt: number
  stage: StageState
  mood: BearMood
  action: BearAction
  /** 已点选的物品 id */
  selected: string[]
  /** 识别中间结果，只用于让麦克风"跟着说话动" */
  interim: string
  /** 当前该高亮跳动的物品（支架一/二） */
  highlight: string[]
  /** 支架二的图片顺序卡 */
  pictureCards: string[]
  /** fallback 后允许点任意物品继续 */
  tapToContinue: boolean
  /** 麦克风不可用（拒权 / 浏览器不支持）时切成纯点选模式 */
  voiceDisabled: boolean
  micSupported: boolean
}

const INITIAL_STAGE = (scene: Scene): StageState => ({
  backdrop: scene.backdrop,
  weather: scene.weather ?? null,
  collected: [],
  revealed: [],
  removed: [],
  wearing: null,
  holding: null,
})

export function useBeatMachine(scene: Scene, onSceneComplete: () => void) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [beatIndex, setBeatIndex] = useState(0)
  const [question, setQuestion] = useState<Question | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [stage, setStage] = useState<StageState>(() => INITIAL_STAGE(scene))
  const [mood, setMood] = useState<BearMood>('neutral')
  const [action, setAction] = useState<BearAction>('idle')
  const [selected, setSelected] = useState<string[]>([])
  const [interim, setInterim] = useState('')
  const [highlight, setHighlight] = useState<string[]>([])
  const [pictureCards, setPictureCards] = useState<string[]>([])
  const [tapToContinue, setTapToContinue] = useState(false)
  const [voiceDisabled, setVoiceDisabled] = useState(false)

  const micSupported = useMemo(() => isRecognitionSupported(), [])
  const beat = scene.beats[beatIndex] ?? null

  // 本问从开始到现在用过的最高支架级别，用于写进度记录
  const supportUsedRef = useRef(0)
  const listenRef = useRef<ListenHandle | null>(null)
  // 已卸载后不要再 setState —— 故事流程是一串 await，随时可能被退出打断
  const aliveRef = useRef(true)

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      listenRef.current?.stop()
      cancelSpeech()
    }
  }, [])

  const say = useCallback(async (line: string, m: BearMood = 'talking') => {
    if (!aliveRef.current) return
    setMood(m)
    await speak(line)
    if (!aliveRef.current) return
    setMood('neutral')
  }, [])

  const applyEffects = useCallback((effects: StageEffect[] | undefined) => {
    if (!effects?.length) return
    setStage((prev) => {
      const next = { ...prev, collected: [...prev.collected], revealed: [...prev.revealed], removed: [...prev.removed] }
      for (const fx of effects) {
        switch (fx.kind) {
          case 'collect':
            if (!next.collected.includes(fx.objectId)) next.collected.push(fx.objectId)
            break
          case 'reveal':
            if (!next.revealed.includes(fx.objectId)) next.revealed.push(fx.objectId)
            break
          case 'remove':
            if (!next.removed.includes(fx.objectId)) next.removed.push(fx.objectId)
            break
          case 'wear':
            next.wearing = fx.objectId
            break
          case 'hold':
            next.holding = fx.objectId
            break
          case 'weather':
            next.weather = fx.to
            break
          case 'backdrop':
            next.backdrop = fx.to
            break
        }
      }
      return next
    })
  }, [])

  /* ── 提问 ─────────────────────────────────────────────── */

  const ask = useCallback(
    async (q: Question, isRetry: boolean) => {
      if (!aliveRef.current) return
      setQuestion(q)
      setHighlight([])
      setPictureCards([])
      setTapToContinue(false)
      setInterim('')
      if (!isRetry) {
        setAttempt(0)
        supportUsedRef.current = 0
        setSelected([])
      }

      setPhase('prompt')
      setAction(beat?.characterAnimation ?? 'idle')
      await say(q.line, q.mood === 'neutral' ? 'talking' : q.mood)
      if (!aliveRef.current) return

      // teacher_model：只在首问播一次，重问时不再复读，避免变成念课文
      if (!isRetry && q.teacherModel) {
        await say(q.teacherModel, 'talking')
        if (!aliveRef.current) return
      }

      const needsSelection = !q.isFollowUp && !isRetry && (beat?.requireSelection ?? 0) > 0
      setPhase(needsSelection ? 'observe' : 'invite')
      setMood('waiting')
      setAction('idle')
    },
    [beat, say],
  )

  /* ── 推进到下一拍 ─────────────────────────────────────── */

  const advance = useCallback(async () => {
    if (!aliveRef.current) return
    const nextIndex = beatIndex + 1
    if (nextIndex >= scene.beats.length) {
      setPhase('scene-done')
      setMood('happy')
      setAction('cheer')
      await say(scene.closingLine, 'happy')
      if (!aliveRef.current) return
      finishRun(scene.id, scene.sticker)
      onSceneComplete()
      return
    }
    setBeatIndex(nextIndex)
  }, [beatIndex, onSceneComplete, say, scene])

  // beatIndex 变了就自动问下一拍。放在 effect 里，让 ask 永远拿到新的 beat。
  const startedRef = useRef(false)
  useEffect(() => {
    if (!startedRef.current) return
    const next = scene.beats[beatIndex]
    if (next) void ask(questionFromBeat(next), false)
    // ask 依赖 beat，beat 由 beatIndex 推出，这里只跟 beatIndex 走
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatIndex])

  /* ── 判定与支架 ───────────────────────────────────────── */

  const logAttempt = useCallback(
    (q: Question, level: Awaited<ReturnType<typeof matchIntents>>['level'], transcript: string, spoke: boolean) => {
      recordAttempt({
        sceneId: scene.id,
        beatId: beat?.id ?? q.id,
        questionId: q.id,
        skill: q.skill,
        level,
        supportUsed: supportUsedRef.current,
        spoke,
        transcript,
        wordCount: countWords(transcript),
        at: Date.now(),
      })
    },
    [beat, scene.id],
  )

  const succeed = useCallback(
    async (q: Question, level: 'basic' | 'target' | 'challenge' | null) => {
      if (!aliveRef.current) return
      setPhase('success')
      setHighlight([])
      setPictureCards([])
      setInterim('')

      // 场景变化只在 beat 层发生一次；追问不重复触发效果
      if (!q.isFollowUp) applyEffects(beat?.effects)

      setAction(beat?.successAnimation ?? 'cheer')
      await say(q.successLine, 'happy')
      if (!aliveRef.current) return

      /* 难度递进（设计文档 §6）：只有当孩子**没到最高档**时才追问，
         把她从关键词往完整表达推一层。已经说到 challenge 就直接走，
         不要在孩子做得最好的时候还追加要求。 */
      const shouldFollowUp = !!q.followUp && (level === null || LEVEL_RANK[level] < LEVEL_RANK.challenge)
      if (shouldFollowUp && q.followUp) {
        const depth = q.isFollowUp ? Number(q.id.split('#fu')[1] ?? 0) + 1 : 0
        await ask(questionFromFollowUp(beat?.id ?? q.id, q.followUp, depth), false)
        return
      }
      await advance()
    },
    [advance, applyEffects, ask, beat, say],
  )

  const escalate = useCallback(
    async (q: Question, outcome: 'silence' | 'nomatch') => {
      if (!aliveRef.current) return
      const nextAttempt = attempt + 1
      setAttempt(nextAttempt)
      supportUsedRef.current = Math.max(supportUsedRef.current, nextAttempt)

      if (nextAttempt === 1) {
        setPhase('support')
        // 沉默和"说了但没对上"该给不同的神色：前者是鼓励，后者是"我没听清"
        setMood(outcome === 'silence' ? 'waiting' : 'confused')
        setAction(outcome === 'silence' ? 'lean' : 'shrug')
        setHighlight(q.support.level1.highlight ?? [])
        await say(q.support.level1.line, outcome === 'silence' ? 'waiting' : 'confused')
        if (!aliveRef.current) return
        setPhase('invite')
        setMood('waiting')
        return
      }

      if (nextAttempt === 2) {
        setPhase('support')
        setHighlight(q.support.level1.highlight ?? [])
        setPictureCards(q.support.level2.pictureCards ?? [])
        await say(q.support.level2.line, 'talking')
        if (!aliveRef.current) return
        // 句首支架是**播出来**的，界面上不出现英文（设计文档 §7）
        await say(q.support.level2.starter, 'talking')
        if (!aliveRef.current) return
        setPhase('invite')
        setMood('waiting')
        return
      }

      // 第三次：完整示范，然后允许点击继续。故事不能停在这里。
      setPhase('fallback')
      setMood('happy')
      setAction('lean')
      await say(q.support.fallback.line, 'happy')
      if (!aliveRef.current) return
      logAttempt(q, null, '', outcome !== 'silence')
      setTapToContinue(true)
      setMood('waiting')
    },
    [attempt, logAttempt, say],
  )

  const handleOutcome = useCallback(
    async (q: Question, outcome: ListenOutcome) => {
      if (!aliveRef.current) return
      setInterim('')

      if (outcome.kind === 'denied' || outcome.kind === 'unsupported') {
        // 麦克风用不了：降级成纯点选，故事照常走完（设计文档 §8.3）
        setVoiceDisabled(true)
        setPhase('fallback')
        await say(q.support.fallback.line, 'happy')
        if (!aliveRef.current) return
        logAttempt(q, null, '', false)
        setTapToContinue(true)
        return
      }

      if (outcome.kind === 'error' || outcome.kind === 'silence') {
        await escalate(q, 'silence')
        return
      }

      setPhase('thinking')
      const candidates = outcome.alternatives.length ? outcome.alternatives : [outcome.transcript]
      const result = matchIntents(candidates, q.intents)

      if (result.matched) {
        logAttempt(q, result.level, result.usedTranscript, true)
        await succeed(q, result.level)
        return
      }

      // 说了话但没对上目标表达：仍然算"开口了"，这是产品最看重的行为
      await escalate(q, hasContent(outcome.transcript) ? 'nomatch' : 'silence')
    },
    [escalate, logAttempt, say, succeed],
  )

  /* ── 对外动作 ─────────────────────────────────────────── */

  const startListening = useCallback(() => {
    const q = question
    if (!q || phase === 'listening') return
    unlockSpeech()
    cancelSpeech()
    setPhase('listening')
    setMood('waiting')
    setInterim('')

    listenRef.current = listenOnce(
      {
        onInterim: (t) => aliveRef.current && setInterim(t),
        onSpeechStart: () => aliveRef.current && setMood('surprised'),
        onDone: (outcome) => {
          listenRef.current = null
          void handleOutcome(q, outcome)
        },
      },
      { silenceTimeoutMs: 7000, maxUtteranceMs: 9000 },
    )
  }, [handleOutcome, phase, question])

  const stopListening = useCallback(() => {
    listenRef.current?.stop()
  }, [])

  /** 重听：把当前这一问再播一次（底部的重播按钮）。 */
  const replay = useCallback(async () => {
    const q = question
    if (!q || phase === 'listening') return
    unlockSpeech()
    setPhase('prompt')
    await say(q.line, q.mood)
    if (!aliveRef.current) return
    setPhase('invite')
    setMood('waiting')
  }, [phase, question, say])

  /** 点选舞台物品。 */
  const selectObject = useCallback(
    (objectId: string) => {
      unlockSpeech()

      // fallback 之后：点一下就继续故事，不再要求开口
      if (tapToContinue && question) {
        setTapToContinue(false)
        const q = question
        void (async () => {
          if (!q.isFollowUp) applyEffects(beat?.effects)
          setAction(beat?.successAnimation ?? 'bounce')
          await say(q.successLine, 'happy')
          if (!aliveRef.current) return
          await advance()
        })()
        return
      }

      if (phase !== 'observe' && phase !== 'invite') return

      setSelected((prev) => (prev.includes(objectId) ? prev.filter((x) => x !== objectId) : [...prev, objectId]))
      setAction('lean')

      if (phase === 'observe') {
        const need = beat?.requireSelection ?? 1
        const nextCount = selected.includes(objectId) ? selected.length - 1 : selected.length + 1
        if (nextCount >= need) {
          setPhase('invite')
          setMood('waiting')
        }
      }
    },
    [advance, applyEffects, beat, phase, question, say, selected, tapToContinue],
  )

  /** 麦克风彻底不可用时，孩子用这个按钮继续故事。 */
  const skipWithTap = useCallback(() => {
    const q = question
    if (!q) return
    void escalate(q, 'silence')
  }, [escalate, question])

  /** 开始故事。必须由用户手势调用——iOS 靠这一下解锁音频。 */
  const begin = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true
    unlockSpeech()
    setPhase('intro')
    setMood('happy')
    setAction('wave')
    startRun(scene.id)
    await say(scene.openingLine, 'happy')
    if (!aliveRef.current) return
    const first = scene.beats[0]
    if (first) await ask(questionFromBeat(first), false)
  }, [ask, say, scene])

  const view: MachineView = {
    phase,
    beat,
    beatIndex,
    totalBeats: scene.beats.length,
    question,
    attempt,
    stage,
    mood,
    action,
    selected,
    interim,
    highlight,
    pictureCards,
    tapToContinue,
    voiceDisabled,
    micSupported,
  }

  return { view, begin, startListening, stopListening, replay, selectObject, skipWithTap }
}
