import { test } from 'vitest'
import assert from 'node:assert/strict'

import { createPressToTalk } from './pressToTalk'

/**
 * 这台状态机守的是一个真实踩过的坑：按钮绑 onClick、标签却写"按住说话"，
 * 照标签按住的人按住期间根本没在录音——症状是"说了半天一点反应都没有"。
 *
 * 现在两种习惯都要接住，所以下面每一条都是"某种按法能不能正常说完一句"。
 */

/** 造一台用假时钟的状态机，好精确控制按压时长。 */
function machine(tapMs = 500) {
  let t = 1000
  const m = createPressToTalk({ tapMs, now: () => t })
  return { m, advance: (ms: number) => (t += ms) }
}

test('按住说话：按下开始、松手结束', () => {
  const { m, advance } = machine()
  assert.equal(m.down(false), 'start')
  advance(1200)
  assert.equal(m.up(), 'stop')
  assert.equal(m.isTapMode(), false)
})

test('点一下说话：短按松手不结束，再点一下才结束', () => {
  const { m, advance } = machine()
  assert.equal(m.down(false), 'start')
  advance(120) // 啪地一下就松手
  assert.equal(m.up(), 'none', '短按松手不该结束录音——否则只录到几十毫秒')
  assert.equal(m.isTapMode(), true)

  // 她说完了，再点一下
  assert.equal(m.down(true), 'stop')
  assert.equal(m.isTapMode(), false)
})

test('恰好卡在阈值上：不足算点一下，达到算按住', () => {
  const a = machine(500)
  a.m.down(false)
  a.advance(499)
  assert.equal(a.m.up(), 'none')

  const b = machine(500)
  b.m.down(false)
  b.advance(500)
  assert.equal(b.m.up(), 'stop')
})

test('按住期间重复触发 down 不会把录音停掉', () => {
  /*
   * 手指按在按钮上时，浏览器可能因为指针捕获、多点触控等原因再派发一次 down。
   * 那一下若被当成"再点一下"，录音会在她说到一半时断掉。
   */
  const { m, advance } = machine()
  m.down(false)
  advance(200)
  assert.equal(m.down(true), 'none', '不在点击模式时，重复的 down 应该被忽略')
  advance(800)
  assert.equal(m.up(), 'stop')
})

test('没按下过就松手，什么都不做', () => {
  const { m } = machine()
  assert.equal(m.up(), 'none')
})

test('一轮结束后复位：下一问重新从按住开始', () => {
  const { m, advance } = machine()
  m.down(false)
  advance(100)
  m.up()
  assert.equal(m.isTapMode(), true)

  // 这一问的识别结束了
  m.reset()
  assert.equal(m.isTapMode(), false)

  // 下一问：按住 1 秒松手，应当正常结束，而不是被上一问的点击模式带跑
  assert.equal(m.down(false), 'start')
  advance(1000)
  assert.equal(m.up(), 'stop')
})
