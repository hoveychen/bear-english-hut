import { test, beforeEach } from 'vitest'
import assert from 'node:assert/strict'

/** 最小 localStorage 桩，必须在引入 progress/report 之前装好。 */
const store = new Map<string, string>()
;(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
}

const { recordAttempt, startRun, finishRun } = await import('./progress')
const { buildSceneReport, reportAsText } = await import('./report')
import type { Attempt } from './progress'
import type { IntentLevel, SkillTag } from '../content/types'

function attempt(over: Partial<Attempt> = {}): Attempt {
  return {
    sceneId: 'picnic',
    beatId: 'b1_food',
    questionId: 'b1_food',
    skill: 'request' as SkillTag,
    level: 'target' as IntentLevel,
    supportUsed: 0,
    spoke: true,
    transcript: "Let's take the apple",
    wordCount: 4,
    at: Date.now(),
    ...over,
  }
}

const obs = (r: NonNullable<ReturnType<typeof buildSceneReport>>, key: string) => {
  const o = r.observations.find((x) => x.key === key)
  assert.ok(o, `报告里没有 ${key} 这一项`)
  return o
}

beforeEach(() => store.clear())

test('一次都没说出目标表达时，「是否能听懂任务」必须是未出现', () => {
  startRun('picnic')
  for (let i = 0; i < 4; i++) recordAttempt(attempt({ level: null, supportUsed: 3, spoke: false, wordCount: 0 }))
  const r = buildSceneReport('picnic')
  assert.ok(r)
  const o = obs(r, 'understand')
  assert.equal(o.state, 'no')
  assert.equal(o.stateText, '本次未出现')
})

test('「是否需要支架」这一行极性相反：依赖示范不能说成本次未出现', () => {
  startRun('picnic')
  for (let i = 0; i < 4; i++) recordAttempt(attempt({ level: null, supportUsed: 3, spoke: false }))
  const o = obs(buildSceneReport('picnic')!, 'support')
  assert.equal(o.state, 'no')
  assert.equal(o.stateText, '这次比较依赖')

  store.clear()
  startRun('picnic')
  for (let i = 0; i < 3; i++) recordAttempt(attempt({ supportUsed: 0 }))
  const good = obs(buildSceneReport('picnic')!, 'support')
  assert.equal(good.state, 'yes')
  assert.equal(good.stateText, '这次没用上')
})

test('独立表达 / 句首支架 / 完整示范 三个计数各归各位', () => {
  startRun('picnic')
  recordAttempt(attempt({ supportUsed: 0 }))
  recordAttempt(attempt({ supportUsed: 0 }))
  recordAttempt(attempt({ supportUsed: 2 }))
  recordAttempt(attempt({ level: null, supportUsed: 3, spoke: false }))
  const r = buildSceneReport('picnic')!
  assert.equal(r.independent, 2)
  assert.equal(r.withStarter, 1)
  assert.equal(r.withFullModel, 1)
  assert.equal(r.totalQuestions, 4)
})

test('迁移：同一能力在另一个故事里出现过才算', () => {
  startRun('picnic')
  recordAttempt(attempt({ skill: 'reason' }))
  recordAttempt(attempt({ skill: 'sequence' }))
  finishRun('picnic', 'picnic')

  startRun('ball')
  recordAttempt(attempt({ sceneId: 'ball', beatId: 'b1_guess', questionId: 'b1_guess', skill: 'reason' }))
  recordAttempt(attempt({ sceneId: 'ball', beatId: 'b2_rolled', questionId: 'b2_rolled', skill: 'sequence' }))

  const o = obs(buildSceneReport('ball')!, 'transfer')
  assert.equal(o.state, 'yes', '两项能力都在野餐里出现过，应判为已迁移')
})

test('连续表达：按最长一次的英文词数分档', () => {
  startRun('picnic')
  recordAttempt(attempt({ wordCount: 12, transcript: 'first we wash the apple then we put it in the basket' }))
  assert.equal(obs(buildSceneReport('picnic')!, 'streak').state, 'yes')

  store.clear()
  startRun('picnic')
  recordAttempt(attempt({ wordCount: 3 }))
  assert.equal(obs(buildSceneReport('picnic')!, 'streak').state, 'no')
})

test('纯文本报告包含设计文档 §10 的那几行', () => {
  startRun('picnic')
  recordAttempt(attempt({ supportUsed: 0, skill: 'request' }))
  recordAttempt(attempt({ supportUsed: 2, skill: 'reason' }))
  const text = reportAsText(buildSceneReport('picnic')!)
  for (const line of ['本次完成：', '独立表达：', '借助句首完成：', '建议家庭复听：']) {
    assert.ok(text.includes(line), `纯文本报告缺了「${line}」`)
  }
})

test('没有记录时返回 null，而不是一份空报告', () => {
  assert.equal(buildSceneReport('picnic'), null)
})
