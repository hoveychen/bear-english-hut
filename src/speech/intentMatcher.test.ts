import { test } from 'vitest'
import assert from 'node:assert/strict'

import { matchIntents, normalize, hasContent } from './intentMatcher'
import { picnic } from '../content/picnic'
import { clothes } from '../content/clothes'
import { ball } from '../content/ball'
import type { Beat, Intent, Scene } from '../content/types'

/** 取某一拍的意图表。 */
function beatOf(scene: Scene, id: string): Beat {
  const b = scene.beats.find((x) => x.id === id)
  assert.ok(b, `找不到节点 ${scene.id}/${id}`)
  return b
}

function expectLevel(intents: Intent[], said: string, level: 'basic' | 'target' | 'challenge') {
  const r = matchIntents([said], intents)
  assert.equal(r.level, level, `「${said}」应判为 ${level}，实际 ${r.level}（intent=${r.intentId}）`)
}

function expectNoMatch(intents: Intent[], said: string) {
  const r = matchIntents([said], intents)
  assert.equal(r.matched, false, `「${said}」不该命中，却命中了 ${r.intentId}`)
}

test('归一化：撇号、标点、大小写', () => {
  assert.equal(normalize("Let's take the apple!"), ' lets take the apple ')
  assert.equal(normalize('  IT’S   RAINING.  '), ' its raining ')
})

test('归一化保留中文，以支持中英混说', () => {
  assert.match(normalize('我要 apple'), / apple /)
})

test('野餐 b1：关键词 / 完整句 / 加原因 三档递进', () => {
  const it = beatOf(picnic, 'b1_food').targetIntents
  expectLevel(it, 'Apple.', 'basic')
  expectLevel(it, 'banana', 'basic')
  expectLevel(it, "Let's take the apple.", 'target')
  expectLevel(it, 'I want the banana please', 'target')
  expectLevel(it, "Let's take the apple because I am hungry.", 'challenge')
})

test('野餐 b1：中英混说也接受', () => {
  const it = beatOf(picnic, 'b1_food').targetIntents
  expectLevel(it, '我想要 apple', 'basic')
  expectLevel(it, '我们 take the banana', 'target')
})

test('野餐 b1：无关回答不命中', () => {
  const it = beatOf(picnic, 'b1_food').targetIntents
  expectNoMatch(it, 'hello bear')
  expectNoMatch(it, 'I do not know')
})

test('野餐 b4 追问：设计文档 §9 列出的 because_rain 接受集全部通过', () => {
  const fu = beatOf(picnic, 'b4_rain').followUp
  assert.ok(fu)
  for (const said of ['because it is raining', 'because it rains', 'rainy', 'rain']) {
    assert.equal(matchIntents([said], fu.targetIntents).matched, true, `§9 接受集里的「${said}」应该命中`)
  }
})

test('野餐 b3：First ... then ... 的顺序表达', () => {
  const it = beatOf(picnic, 'b3_sequence').targetIntents
  expectLevel(it, 'wash', 'basic')
  expectLevel(it, 'First we wash it, then we pack it', 'target')
  expectLevel(it, 'First we wash the apple then we put it in the basket', 'challenge')
})

test('穿衣 b1：I am going to wear ...', () => {
  const it = beatOf(clothes, 'b1_weather_pick').targetIntents
  expectLevel(it, 'coat', 'basic')
  expectLevel(it, 'I am going to wear the coat', 'target')
  expectLevel(it, 'I will wear the coat because it is rainy', 'challenge')
})

test('穿衣 b4：too small 与协商', () => {
  const it = beatOf(clothes, 'b4_too_small').targetIntents
  expectLevel(it, 'small', 'basic')
  expectLevel(it, 'This one is too small', 'target')
  expectLevel(it, 'It is too small we need a bigger one', 'challenge')
})

test('找球 b1：介词短语与 I think 句式', () => {
  const it = beatOf(ball, 'b1_guess').targetIntents
  expectLevel(it, 'chair', 'basic')
  expectLevel(it, 'under the chair', 'target')
  expectLevel(it, 'I think it is under the chair', 'challenge')
  expectLevel(it, 'maybe behind the sofa', 'challenge')
})

test('找球 b2：It was ... but now it is ...', () => {
  const it = beatOf(ball, 'b2_rolled').targetIntents
  expectLevel(it, 'behind', 'basic')
  expectLevel(it, 'It is behind the sofa', 'target')
  expectLevel(it, 'It was under the chair but now it is behind the sofa', 'challenge')
})

test('找球 b5：复述两到三处地点', () => {
  const it = beatOf(ball, 'b5_retell').targetIntents
  expectLevel(it, 'the chair', 'basic')
  expectLevel(it, 'First the chair then the sofa', 'target')
  expectLevel(it, 'First it was under the chair then behind the sofa then in the box', 'challenge')
})

test('词形宽容：进行时 / 复数 / 过去式都算同一个词', () => {
  const it = beatOf(picnic, 'b4_rain').targetIntents
  expectLevel(it, 'raining', 'basic')
  const cookies = beatOf(picnic, 'b1_food').targetIntents
  expectLevel(cookies, 'cookies', 'basic')
})

test('遍历识别候选：正确答案排在第二条也能取到', () => {
  const it = beatOf(picnic, 'b4_rain').targetIntents
  // 浏览器对儿童声音常把首选听错，正确的排在后面
  const r = matchIntents(['a umbra', 'we need an umbrella'], it)
  assert.equal(r.level, 'target')
  assert.equal(r.usedTranscript, 'we need an umbrella')
})

test('hasContent 区分沉默与说了但没match', () => {
  assert.equal(hasContent(''), false)
  assert.equal(hasContent('  '), false)
  assert.equal(hasContent('um uh hmm'), false)
  assert.equal(hasContent('purple monkey'), true)
})

test('每个节点的 basic 档都能被它自己的示范句命中', () => {
  for (const scene of [picnic, clothes, ball]) {
    for (const beat of scene.beats) {
      const checks: Array<{ where: string; intents: Intent[] }> = [
        { where: `${scene.id}/${beat.id}`, intents: beat.targetIntents },
      ]
      let fu = beat.followUp
      let depth = 0
      while (fu) {
        checks.push({ where: `${scene.id}/${beat.id}/followUp#${depth}`, intents: fu.targetIntents })
        fu = fu.followUp
        depth++
      }
      for (const { where, intents } of checks) {
        for (const intent of intents) {
          const r = matchIntents([intent.model], intents)
          assert.equal(r.matched, true, `${where} 的示范句「${intent.model}」自己都匹配不上`)
        }
        // 支架最后给的完整示范也必须能命中，否则 fallback 播完孩子跟读还是"错"
        const beatSupport = checks.length === 1 ? beat.support : null
        if (beatSupport) {
          const r = matchIntents([beatSupport.fallback.line], intents)
          assert.equal(r.matched, true, `${where} 的 fallback 示范「${beatSupport.fallback.line}」匹配不上`)
        }
      }
    }
  }
})
