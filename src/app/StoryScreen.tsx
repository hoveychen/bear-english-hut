import { useEffect, useState } from 'react'

import type { Scene } from '../content/types'
import { useBeatMachine } from '../state/useBeatMachine'
import { StoryStage } from '../components/StoryStage'
import { SpeechButton } from '../components/SpeechButton'
import { SupportPrompt } from '../components/SupportPrompt'
import { HandHint } from '../components/HandHint'
import { hasSeenHint, markHintSeen } from '../state/progress'
import { speak, unlockSpeech } from '../speech/synthesis'
import './StoryScreen.css'

/**
 * 一个故事的完整界面。
 *
 * 结构照设计文档 §7：中央是绘本舞台，底部是大麦克风和重播，角落是暂停/退出。
 * 屏幕上唯一的文字是右上角那颗给大人用的退出键——孩子看的部分一个字都没有。
 */

type Props = {
  scene: Scene
  onExit: () => void
  onComplete: () => void
}

export function StoryScreen({ scene, onExit, onComplete }: Props) {
  const { view, begin, startListening, stopListening, replay, selectObject, skipWithTap } = useBeatMachine(
    scene,
    onComplete,
  )

  // 进入故事即开始。父层只在用户点过"开始"之后才挂载本组件，
  // 所以这里已经处在用户手势的余荫里，iOS 的音频解锁是有效的。
  useEffect(() => {
    void begin()
    // 只在挂载时跑一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inviting = view.phase === 'invite' || view.phase === 'observe'

  /*
   * 第一次玩时的手指演示。
   *
   * 只在**第一个故事的第一拍、第一问**出现（attempt === 0）：孩子一旦走到支架，
   * 小熊本来就会换个说法再问、还会高亮物品，再叠一只手指只会更吵。
   */
  const [hintSeen, setHintSeen] = useState(() => hasSeenHint())
  /*
   * observe 阶段分两小步：先指一下"再听一次"，再指该点的物品。
   *
   * 喇叭放在最前面而不是等孩子卡住才教：小熊刚说完、她还没动手的这一刻，
   * 正是"没听清"最可能发生的时候；而如果等进了支架再教，第一次就说对的
   * 孩子会永远不知道有这颗键。
   */
  const [hintStep, setHintStep] = useState<'replay' | 'object'>('replay')
  const showHint = !hintSeen && view.beatIndex === 0 && view.attempt === 0 && !view.tapToContinue
  const firstTarget = view.beat?.objects.find((o) => o.correct && !o.hidden) ?? view.beat?.objects.find((o) => !o.hidden)
  const micUsable = view.micSupported && !view.voiceDisabled

  useEffect(() => {
    if (!showHint || view.phase !== 'observe') return
    setHintStep('replay')
    const t = window.setTimeout(() => setHintStep('object'), 2600)
    return () => window.clearTimeout(t)
  }, [showHint, view.phase])

  const hint: { target: string; gesture: 'tap' | 'hold' } | null = !showHint
    ? null
    : view.phase === 'observe'
      ? hintStep === 'replay'
        ? { target: '[aria-label="再听一次"]', gesture: 'tap' }
        : firstTarget
          ? { target: `.stage__object[aria-label="${firstTarget.id}"]`, gesture: 'tap' }
          : null
      : view.phase === 'invite' && micUsable
        ? { target: '.mic__button', gesture: 'hold' }
        : null

  /*
   * 麦克风用不上时（拒权、浏览器不支持），演示就只剩"点一下物品"这一步，
   * 没有第二步可演。这种情况下到了 invite 阶段就直接收工，别让手指一直
   * 指着一颗按不动的按钮。
   */
  useEffect(() => {
    if (showHint && view.phase === 'invite' && !micUsable) {
      markHintSeen()
      setHintSeen(true)
    }
  }, [showHint, view.phase, micUsable])

  const finishHint = () => {
    if (hintSeen) return
    markHintSeen()
    setHintSeen(true)
  }

  const replayStarter = () => {
    unlockSpeech()
    const starter = view.question?.support.level2.starter
    if (starter) void speak(starter)
  }

  return (
    <div className="story">
      <header className="story__top">
        <button type="button" className="story__exit" onClick={onExit} aria-label="退出故事">
          {/* 手绘的返回箭头。文字"退出"只留给读屏，视觉上是图形 */}
          <svg viewBox="0 0 36 36" width="26" height="26" aria-hidden="true">
            <path d="M23 8 L12 18 L23 28" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 进度：一串小圆点，走过的填实。没有百分比、没有分数。 */}
        <div className="story__beads" aria-label={`第 ${view.beatIndex + 1} 段，共 ${view.totalBeats} 段`}>
          {Array.from({ length: view.totalBeats }, (_, i) => (
            <span key={i} className={i < view.beatIndex ? 'is-done' : i === view.beatIndex ? 'is-now' : ''} />
          ))}
        </div>

        <span className="story__spacer" />
      </header>

      <StoryStage view={view} onSelectObject={selectObject} />

      <footer className="story__bottom">
        {view.pictureCards.length > 0 && <SupportPrompt cards={view.pictureCards} onReplayStarter={replayStarter} />}

        <SpeechButton
          phase={view.phase}
          inviting={inviting && !view.tapToContinue}
          interim={view.interim}
          micSupported={view.micSupported}
          voiceDisabled={view.voiceDisabled}
          onStart={() => {
            // 按住麦克风就是这段演示的终点：两步都做过了，往后不再出现
            finishHint()
            startListening()
          }}
          onStop={stopListening}
          onReplay={() => void replay()}
          onSkip={skipWithTap}
        />

        {/*
         * fallback 之后的"点一下继续"。这是设计文档 §8.1 沉默分支的落点：
         * 展示动作提示并允许点击继续——故事永远不会卡在孩子说不出来的地方。
         */}
        {view.tapToContinue && (
          <p className="story__tapHint" role="status">
            <span className="story__tapHand" aria-hidden="true">
              <svg viewBox="0 0 40 44" width="28" height="31">
                <path
                  d="M14 26 L14 10 a4 4 0 0 1 8 0 L22 24 L24 14 a4 4 0 0 1 8 1 L31 30 q-1 11 -12 11 q-9 0 -12 -9 L4 24 a4 4 0 0 1 6 -5 Z"
                  fill="var(--paper-lit)"
                  stroke="var(--ink)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            点一下画面，故事继续
          </p>
        )}
      </footer>

      {hint && <HandHint target={hint.target} gesture={hint.gesture} />}
    </div>
  )
}
