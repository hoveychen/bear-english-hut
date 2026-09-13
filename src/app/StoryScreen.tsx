import { useEffect } from 'react'

import type { Scene } from '../content/types'
import { useBeatMachine } from '../state/useBeatMachine'
import { StoryStage } from '../components/StoryStage'
import { SpeechButton } from '../components/SpeechButton'
import { SupportPrompt } from '../components/SupportPrompt'
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
          onStart={startListening}
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
    </div>
  )
}
