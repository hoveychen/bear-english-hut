/**
 * 语音输入（设计文档 §8.1）。
 *
 * 每次只监听一个短回答。这一层**只管录音状态**，不判断对错——
 * 意图判定全在 intentMatcher.ts。这样将来换成云端识别时，
 * 需要替换的只有本文件。
 */

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
  onspeechstart: (() => void) | null
}

function getCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && getCtor() !== null
}

/** 一次收听的结果。`transcript` 是最佳猜测，`alternatives` 含全部候选。 */
export type ListenOutcome =
  | { kind: 'heard'; transcript: string; alternatives: string[]; confidence: number }
  | { kind: 'silence' } // 没听到人声 —— 走"沉默"分支
  | { kind: 'denied' } // 麦克风权限被拒
  | { kind: 'unsupported' } // 浏览器不支持
  | { kind: 'error'; message: string }

export type ListenHandle = {
  /** 提前结束收听（孩子再次点麦克风，或场景被打断）。 */
  stop(): void
}

export type ListenCallbacks = {
  /** 中间结果，用于让麦克风按钮"跟着说话动"，不参与判定。 */
  onInterim?(text: string): void
  /** 检测到开始说话——用来关掉"快说呀"的提示动画。 */
  onSpeechStart?(): void
  onDone(outcome: ListenOutcome): void
}

export type ListenOptions = {
  /** 迟迟不开口多久算沉默。5 岁孩子需要想，给足时间。 */
  silenceTimeoutMs?: number
  /** 开口之后最长再录多久，防止一直不停。 */
  maxUtteranceMs?: number
}

/**
 * 听一次。无论成功失败都恰好回调一次 `onDone`，故事因此永远不会卡住
 * （设计文档 §8.3：识别失败必须可以继续）。
 */
export function listenOnce(cb: ListenCallbacks, opts: ListenOptions = {}): ListenHandle {
  const { silenceTimeoutMs = 7000, maxUtteranceMs = 9000 } = opts
  const Ctor = getCtor()

  if (!Ctor) {
    queueMicrotask(() => cb.onDone({ kind: 'unsupported' }))
    return { stop() {} }
  }

  const rec = new Ctor()
  rec.lang = 'en-US'
  rec.continuous = false
  rec.interimResults = true
  rec.maxAlternatives = 3

  let settled = false
  let heardSpeech = false
  let best = ''
  let alternatives: string[] = []
  let confidence = 0
  let silenceTimer = 0
  let maxTimer = 0

  const finish = (outcome: ListenOutcome) => {
    if (settled) return
    settled = true
    window.clearTimeout(silenceTimer)
    window.clearTimeout(maxTimer)
    try {
      rec.abort()
    } catch {
      /* 已经停了 */
    }
    cb.onDone(outcome)
  }

  silenceTimer = window.setTimeout(() => {
    if (!heardSpeech) finish({ kind: 'silence' })
  }, silenceTimeoutMs)

  rec.onspeechstart = () => {
    heardSpeech = true
    window.clearTimeout(silenceTimer)
    cb.onSpeechStart?.()
    maxTimer = window.setTimeout(() => {
      try {
        rec.stop()
      } catch {
        /* noop */
      }
    }, maxUtteranceMs)
  }

  rec.onresult = (e: any) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const result = e.results[i]
      if (result.isFinal) {
        best = result[0]?.transcript ?? ''
        confidence = result[0]?.confidence ?? 0
        alternatives = Array.from({ length: result.length }, (_, k) => result[k]?.transcript ?? '').filter(Boolean)
      } else {
        interim += result[0]?.transcript ?? ''
      }
    }
    if (interim) {
      heardSpeech = true
      window.clearTimeout(silenceTimer)
      cb.onInterim?.(interim)
    }
  }

  rec.onerror = (e: any) => {
    const err = e?.error ?? 'unknown'
    if (err === 'not-allowed' || err === 'service-not-allowed') return finish({ kind: 'denied' })
    if (err === 'no-speech' || err === 'aborted') return finish({ kind: 'silence' })
    finish({ kind: 'error', message: String(err) })
  }

  rec.onend = () => {
    const text = best.trim()
    if (text) {
      // confidence 只作为辅助信号带出去，不在这里做任何门限判断（设计文档 §8.1）
      finish({ kind: 'heard', transcript: text, alternatives: alternatives.length ? alternatives : [text], confidence })
    } else {
      finish({ kind: 'silence' })
    }
  }

  try {
    rec.start()
  } catch {
    finish({ kind: 'error', message: 'start-failed' })
  }

  return {
    stop() {
      try {
        rec.stop()
      } catch {
        finish({ kind: 'silence' })
      }
    },
  }
}
