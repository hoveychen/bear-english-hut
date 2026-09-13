import { useCallback, useState } from 'react'

import { getScene } from '../content'
import { earnedStickers } from '../state/progress'
import type { StickerId } from '../components/HandDrawn'
import { cancelSpeech } from '../speech/synthesis'
import { HomeScreen } from './HomeScreen'
import { StoryScreen } from './StoryScreen'
import { ParentReport } from './ParentReport'
import { StartGate } from './StartGate'
import './App.css'

type Screen = { name: 'home' } | { name: 'story'; sceneId: string } | { name: 'parent' }

export function App() {
  // 首屏必须先有一次用户手势，否则 iOS / Safari 的音频全程静音
  const [started, setStarted] = useState(false)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [stickers, setStickers] = useState<StickerId[]>(() => earnedStickers())
  const [justEarned, setJustEarned] = useState<StickerId | null>(null)

  const goHome = useCallback(() => {
    cancelSpeech()
    setScreen({ name: 'home' })
  }, [])

  const handleComplete = useCallback((sceneId: string) => {
    const scene = getScene(sceneId)
    // 状态机在调到这里之前已经写过 finishRun，所以直接从存储重读
    setStickers(earnedStickers())
    setJustEarned(scene?.sticker ?? null)
    setScreen({ name: 'home' })
  }, [])

  if (!started) return <StartGate onStart={() => setStarted(true)} />

  if (screen.name === 'parent') return <ParentReport onExit={goHome} />

  if (screen.name === 'story') {
    const scene = getScene(screen.sceneId)
    if (!scene) return <HomeScreen earnedStickers={stickers} justEarned={null} onPickScene={() => {}} onCeremonyDone={() => {}} onOpenParent={() => {}} />
    return (
      <StoryScreen
        // key 让每次进入故事都是一个全新的状态机，不会带着上一局的残留
        key={scene.id}
        scene={scene}
        onExit={goHome}
        onComplete={() => handleComplete(scene.id)}
      />
    )
  }

  return (
    <HomeScreen
      earnedStickers={stickers}
      justEarned={justEarned}
      onPickScene={(sceneId) => setScreen({ name: 'story', sceneId })}
      onCeremonyDone={() => setJustEarned(null)}
      onOpenParent={() => setScreen({ name: 'parent' })}
    />
  )
}
