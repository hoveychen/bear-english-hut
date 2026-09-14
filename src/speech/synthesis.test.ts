import { test, beforeEach, afterEach, vi, expect } from 'vitest'

/**
 * 录音 / TTS 的选路逻辑。
 *
 * 这是接入真人预录音之后最该守住的东西：录了的走录音、没录的走 TTS、
 * 录音坏了也要回落到 TTS 而不是让故事卡住。三条里任何一条断了，
 * 症状都是"某一句突然不出声"或"突然变回机器音"——靠耳朵很难定位。
 */

type Spoken = { audio: string[]; tts: string[] }

/**
 * 每个用例都要一份干净的模块状态：synthesis.ts 会把 manifest 缓存在模块作用域。
 *
 * 这里自己搭一个最小 `window` 而不是把整个 jsdom 拉进来——被测代码只用到
 * `window.speechSynthesis` 和 `window.setTimeout` 两样东西，为这两样引入一个
 * 完整 DOM 实现不划算，而且 jsdom 自己并不实现 speechSynthesis，照样得桩。
 */
async function freshSynthesis(
  manifest: Record<string, string> | null,
  opts: { audioFails?: boolean; noSynthesis?: boolean; manifestDelayMs?: number; audioHangs?: boolean } = {},
) {
  vi.resetModules()
  const spoken: Spoken = { audio: [], tts: [] }
  let manifestFetches = 0

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url).endsWith('manifest.json')) {
        manifestFetches++
        // 模拟真实网络：manifest 不是立刻就位的
        if (opts.manifestDelayMs) await new Promise((r) => setTimeout(r, opts.manifestDelayMs))
        if (!manifest) return { ok: false } as Response
        return { ok: true, json: async () => manifest } as unknown as Response
      }
      return { ok: false } as Response
    }),
  )

  class FakeAudio {
    onended: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor(public src: string) {}
    async play() {
      if (opts.audioFails) throw new Error('decode failed')
      spoken.audio.push(this.src.split('/').pop()!)
      // 播得出声但 ended 永不来：设备缺失、下载断流、移动端后台标签页都会这样
      if (opts.audioHangs) return
      // 真实 Audio 的 ended 是异步来的
      queueMicrotask(() => this.onended?.())
    }
    pause() {}
  }
  vi.stubGlobal('Audio', FakeAudio)

  class FakeUtterance {
    lang = ''
    rate = 1
    pitch = 1
    voice: unknown = null
    onend: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor(public text: string) {}
  }
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)

  const synth = {
    getVoices: () => [{ name: 'Samantha', lang: 'en-US' }],
    addEventListener: () => {},
    cancel: () => {},
    speak: (u: FakeUtterance) => {
      // 解锁用的空串不算一次发声
      if (u.text) spoken.tts.push(u.text)
      queueMicrotask(() => u.onend?.())
    },
  }

  const win: Record<string, unknown> = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  }
  if (!opts.noSynthesis) win.speechSynthesis = synth

  vi.stubGlobal('window', win)
  vi.stubGlobal('speechSynthesis', opts.noSynthesis ? undefined : synth)

  const mod = await import('./synthesis')
  return { mod, spoken, manifestFetches: () => manifestFetches }
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const LINE = 'We need an umbrella because it is raining.'

test('manifest 里有录音的句子走录音，不碰 TTS', async () => {
  const { mod, spoken } = await freshSynthesis({ [LINE]: 'umbrella-rain.mp3' })
  await mod.speak(LINE, { tailMs: 0 })

  expect(spoken.audio).toEqual(['umbrella-rain.mp3'])
  expect(spoken.tts).toEqual([])
})

test('manifest 里没有的句子回落 TTS', async () => {
  const { mod, spoken } = await freshSynthesis({ [LINE]: 'umbrella-rain.mp3' })
  await mod.speak('Some line nobody recorded.', { tailMs: 0 })

  expect(spoken.audio).toEqual([])
  expect(spoken.tts).toEqual(['Some line nobody recorded.'])
})

test('录音播放失败时回落 TTS —— 故事不能因为一个坏文件停住', async () => {
  const { mod, spoken } = await freshSynthesis({ [LINE]: 'umbrella-rain.mp3' }, { audioFails: true })
  await mod.speak(LINE, { tailMs: 0 })

  expect(spoken.audio).toEqual([])
  expect(spoken.tts).toEqual([LINE])
})

test('完全没有 manifest 时全部走 TTS，且不报错', async () => {
  const { mod, spoken } = await freshSynthesis(null)
  await mod.speak(LINE, { tailMs: 0 })

  expect(spoken.tts).toEqual([LINE])
})

test('同一次会话里可以录音与 TTS 混用（分批录音的前提）', async () => {
  const { mod, spoken } = await freshSynthesis({ [LINE]: 'umbrella-rain.mp3' })
  await mod.speak(LINE, { tailMs: 0 })
  await mod.speak('Not recorded yet.', { tailMs: 0 })
  await mod.speak(LINE, { tailMs: 0 })

  expect(spoken.audio).toEqual(['umbrella-rain.mp3', 'umbrella-rain.mp3'])
  expect(spoken.tts).toEqual(['Not recorded yet.'])
})

test('manifest 还在路上时并发 speak，两句都要走录音', async () => {
  // 真实故障：开场白触发了 manifest 的 fetch，紧跟着的提问句在 fetch 落地前
  // 也调了 speak。旧实现把 `loaded` 布尔在 await 之前就置真，于是第二句拿到
  // 空 manifest、静默回落 TTS——一句话音色突变，却不报任何错。
  const { mod, spoken, manifestFetches } = await freshSynthesis(
    { [LINE]: 'a.mp3', 'Second line.': 'b.mp3' },
    { manifestDelayMs: 30 },
  )

  await Promise.all([mod.speak(LINE, { tailMs: 0 }), mod.speak('Second line.', { tailMs: 0 })])

  expect(spoken.tts).toEqual([])
  expect(spoken.audio.sort()).toEqual(['a.mp3', 'b.mp3'])
  // 顺带确认没有把 manifest 重复拉两遍
  expect(manifestFetches()).toBe(1)
})

test('连 speechSynthesis 都没有的浏览器：speak 照样 resolve，绝不 reject', async () => {
  const { mod, spoken } = await freshSynthesis(null, { noSynthesis: true })
  await expect(mod.speak('anything', { tailMs: 0 })).resolves.toBeUndefined()
  expect(spoken.tts).toEqual([])
})

test('音频播放挂起（既不 ended 也不 error）时，speak 仍然会结束', async () => {
  /*
   * 这一条守的是"故事不能有死胡同"。
   *
   * 状态机是 `await say(...)` 之后才把阶段推到 observe/invite 的，所以一个
   * 永不 settle 的 promise 和抛异常一样要命：界面会永远停在小熊说完话那一屏，
   * 孩子按什么都没反应。而 `play()` 已经 resolve、`onended` 却不来，在真实
   * 设备上是会发生的——音频设备缺失、下载中途断流、移动浏览器把标签页转入后台。
   */
  const { mod, spoken } = await freshSynthesis({ [LINE]: 'umbrella-rain.mp3' }, { audioHangs: true })

  let settled = false
  const p = mod.speak(LINE, { tailMs: 0 }).then(() => {
    settled = true
  })

  // 走到超时之前不该提前结束
  await vi.advanceTimersByTimeAsync(3000)
  expect(settled).toBe(false)

  // 上限是 min(16000, 5000 + 文本长度 * 120)，推过去之后必须结束
  await vi.advanceTimersByTimeAsync(16000)
  await p
  expect(settled).toBe(true)
  // 确实尝试播过录音，不是绕过去直接 resolve
  expect(spoken.audio).toEqual(['umbrella-rain.mp3'])
})
