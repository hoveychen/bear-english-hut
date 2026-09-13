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
  opts: { audioFails?: boolean; noSynthesis?: boolean } = {},
) {
  vi.resetModules()
  const spoken: Spoken = { audio: [], tts: [] }

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url).endsWith('manifest.json')) {
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
  return { mod, spoken }
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

test('连 speechSynthesis 都没有的浏览器：speak 照样 resolve，绝不 reject', async () => {
  const { mod, spoken } = await freshSynthesis(null, { noSynthesis: true })
  await expect(mod.speak('anything', { tailMs: 0 })).resolves.toBeUndefined()
  expect(spoken.tts).toEqual([])
})
