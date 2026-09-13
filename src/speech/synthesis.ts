/**
 * 语音输出（设计文档 §8.2）。
 *
 * 两条路径，优先级明确：
 *   1. 预录音 —— 核心示范句用真人录音，保证音色、节奏和重复播放的一致性
 *   2. speechSynthesis —— 开发阶段与缺录音时的备用
 *
 * 录音怎么接进来：往 public/audio/ 放文件，并在 public/audio/manifest.json 里
 * 写 { "We need an umbrella because it is raining.": "umbrella-rain.mp3" }。
 * 代码不需要改一行——这就是把台词留在内容层、不写死在组件里的好处。
 */

let voice: SpeechSynthesisVoice | null = null
let voicesReady = false
let manifest: Record<string, string> = {}
let manifestPromise: Promise<void> | null = null

/** iOS / Safari 要求首次发声必须由用户手势触发，否则后续全部静音。 */
let unlocked = false

const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/`

function pickVoice(): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis?.getVoices?.() ?? []
  if (all.length === 0) return null
  const en = all.filter((v) => v.lang?.toLowerCase().startsWith('en'))
  if (en.length === 0) return null

  // 儿童向：优先挑听感柔和的常见系统音色，其次任意 en-US，最后任意 en。
  const preferred = ['samantha', 'karen', 'moira', 'tessa', 'ava', 'allison', 'google us english', 'zira']
  for (const name of preferred) {
    const hit = en.find((v) => v.name.toLowerCase().includes(name))
    if (hit) return hit
  }
  return en.find((v) => v.lang.toLowerCase() === 'en-us') ?? en[0]
}

function ensureVoices() {
  if (voicesReady || !('speechSynthesis' in window)) return
  voice = pickVoice()
  if (voice) {
    voicesReady = true
  } else {
    // Chrome 首次 getVoices() 返回空数组，要等 voiceschanged
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        voice = pickVoice()
        voicesReady = !!voice
      },
      { once: true },
    )
  }
}

/**
 * 加载 manifest，**并发安全**。
 *
 * 缓存的是 Promise，不是一个 `loaded` 布尔。第一版写成：
 *
 *     if (manifestLoaded) return
 *     manifestLoaded = true        // ← 在 await 之前就置位
 *     ... await fetch(...)
 *
 * 于是第二个在 fetch 落地前进来的调用者直接返回，而 `manifest` 还是空的——
 * 那句台词明明有音频，却静默回落成了浏览器 TTS。实测里就是这样：
 * 故事开场白和示范句走了文件，夹在中间的提问句走了 TTS。
 * 这种错不会报任何错误，只会让一句话音色突变。
 */
function ensureManifest(): Promise<void> {
  manifestPromise ??= (async () => {
    try {
      const res = await fetch(`${AUDIO_BASE}manifest.json`, { cache: 'force-cache' })
      if (res.ok) manifest = await res.json()
    } catch {
      // 没有音频就走 TTS，这是预期路径，不是错误
    }
  })()
  return manifestPromise
}

/** 在第一次用户手势里调一次，解锁 iOS 的语音合成。 */
export function unlockSpeech() {
  if (unlocked || !('speechSynthesis' in window)) return
  unlocked = true
  ensureVoices()
  const u = new SpeechSynthesisUtterance('')
  u.volume = 0
  window.speechSynthesis.speak(u)
}

export function isSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let currentAudio: HTMLAudioElement | null = null

/** 打断当前所有播放。切换节点、孩子按下麦克风时都要调。 */
export function cancelSpeech() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  if (isSynthesisSupported()) window.speechSynthesis.cancel()
}

export type SpeakOptions = {
  /** 默认 0.85：比成人语速慢，给 5 岁孩子留出听懂的时间（设计文档 §8.2）。 */
  rate?: number
  pitch?: number
  /** 播完后额外静默多少毫秒再 resolve，给孩子一点反应间隙。 */
  tailMs?: number
}

/**
 * 播一句台词。Promise 在播完（或失败）后 resolve——**永远不 reject**：
 * 语音播不出来时故事必须能继续（设计文档 §8.3）。
 */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  const { rate = 0.85, pitch = 1.1, tailMs = 180 } = opts
  cancelSpeech()

  return new Promise<void>((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      window.setTimeout(resolve, tailMs)
    }

    ensureManifest().then(() => {
      const file = manifest[text]
      if (file) {
        const audio = new Audio(`${AUDIO_BASE}${file}`)
        currentAudio = audio
        audio.onended = done
        audio.onerror = () => speakWithTts(text, rate, pitch, done)
        audio.play().catch(() => speakWithTts(text, rate, pitch, done))
        return
      }
      speakWithTts(text, rate, pitch, done)
    })
  })
}

function speakWithTts(text: string, rate: number, pitch: number, done: () => void) {
  if (!isSynthesisSupported()) {
    done()
    return
  }
  ensureVoices()

  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = rate
  u.pitch = pitch
  if (voice) u.voice = voice
  u.onend = done
  u.onerror = done
  window.speechSynthesis.speak(u)

  // 兜底：部分浏览器在长句上不触发 onend。按字数估个上限，宁可早一点放行。
  const estimateMs = Math.min(15000, 1400 + (text.length / rate) * 78)
  window.setTimeout(done, estimateMs)
}
