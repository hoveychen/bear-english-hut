import type { Scene } from './types'

/**
 * 场景一：小熊准备野餐（设计文档 §5.1）
 *
 * 五个互动任务依次对应 b1..b5：
 *   选食物 → 选杯子和毯子 → 解释原因 → 按顺序装篮子 → 下雨后的预测
 *
 * 关键词表刻意写得宽松：5 岁孩子的口音、中英混说和浏览器识别的错字都要能过。
 * `confidence` 不参与判定（设计文档 §8.1）。
 */
export const picnic: Scene = {
  id: 'picnic',
  title: '小熊准备野餐',
  subtitle: '帮小熊把野餐篮装好，再想想下雨要带什么',
  backdrop: 'home',
  weather: 'sun',
  sticker: 'picnic',
  openingLine: "Hello! I am going on a picnic today. Will you help me get ready?",
  closingLine: "What a wonderful picnic! Thank you for helping me. You talked so much today!",

  beats: [
    /* ── b1 选食物 ───────────────────────────────────────── */
    {
      id: 'b1_food',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: "My basket is empty. What should we bring to eat?",
      teacherModel: "You can say: Let's take the apple.",
      requireSelection: 1,
      skill: 'request',
      objects: [
        { id: 'apple', art: 'apple', x: 40, y: 70, correct: true },
        { id: 'banana', art: 'banana', x: 53, y: 77, correct: true },
        { id: 'cookie', art: 'cookie', x: 66, y: 70, correct: true },
        { id: 'boots', art: 'boots', x: 79, y: 77, correct: false },
        { id: 'basket', art: 'basket', x: 91, y: 66, scale: 1.25 },
      ],
      targetIntents: [
        {
          id: 'food_word',
          level: 'basic',
          keywords: [['apple'], ['banana'], ['cookie'], ['cookies'], ['food']],
          model: 'Apple.',
        },
        {
          id: 'food_sentence',
          level: 'target',
          keywords: [
            ['take', 'apple|banana|cookie|cookies'],
            ['bring', 'apple|banana|cookie|cookies'],
            ['want', 'apple|banana|cookie|cookies'],
            ['need', 'apple|banana|cookie|cookies'],
          ],
          model: "Let's take the apple.",
        },
        {
          id: 'food_reason',
          level: 'challenge',
          keywords: [['because', 'apple|banana|cookie|cookies|hungry|yummy|eat']],
          model: "Let's take the apple because I am hungry.",
        },
      ],
      followUp: {
        line: "Good! Can you say it in a big sentence? Let's take the ...",
        mood: 'waiting',
        skill: 'request',
        successLine: "Let's take it! Into the basket it goes.",
        targetIntents: [
          {
            id: 'food_sentence_fu',
            level: 'target',
            keywords: [
              ['take', 'apple|banana|cookie|cookies'],
              ['bring', 'apple|banana|cookie|cookies'],
              ['want', 'apple|banana|cookie|cookies'],
              ["let's|lets|let us"],
            ],
            model: "Let's take the apple.",
          },
        ],
        support: {
          level1: { line: "Try with me. Let's take the ... what?", highlight: ['apple', 'banana', 'cookie'] },
          level2: { line: 'Start like this.', starter: "Let's take the ..." },
          fallback: { line: "Let's take the apple. Your turn next time!", allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look at the food. What should we bring?', highlight: ['apple', 'banana', 'cookie'] },
        level2: { line: 'You can start like this.', starter: "Let's take the ..." },
        fallback: { line: "Let's take the apple. Tap the food you like!", allowTapToContinue: true },
      },
      successLine: 'Yummy! Thank you.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'apple' }],
    },

    /* ── b2 选杯子和毯子 ─────────────────────────────────── */
    {
      id: 'b2_cup_blanket',
      mood: 'waiting',
      characterAnimation: 'idle',
      promptLine: 'We have food. Is there anything else we need?',
      requireSelection: 1,
      skill: 'request',
      objects: [
        { id: 'cup', art: 'cup', x: 40, y: 70, correct: true },
        { id: 'blanket', art: 'drawn:blanket', x: 54, y: 78, correct: true, scale: 1.1 },
        { id: 'sunglasses', art: 'sunglasses', x: 68, y: 70, correct: false },
        { id: 'ball', art: 'ball', x: 80, y: 77, correct: false },
        { id: 'basket', art: 'basket', x: 91, y: 66, scale: 1.25 },
      ],
      targetIntents: [
        {
          id: 'thing_word',
          level: 'basic',
          keywords: [['cup'], ['blanket'], ['drink'], ['water'], ['juice'], ['mat'], ['towel']],
          model: 'A cup.',
        },
        {
          id: 'thing_sentence',
          level: 'target',
          keywords: [
            ['need', 'cup|blanket|water|drink|juice'],
            ['take', 'cup|blanket|water|drink|juice'],
            ['bring', 'cup|blanket|water|drink|juice'],
            ['want', 'cup|blanket|water|drink|juice'],
          ],
          model: 'We need a cup.',
        },
        {
          id: 'thing_reason',
          level: 'challenge',
          keywords: [['because', 'cup|blanket|drink|thirsty|sit|grass|water']],
          model: 'We need a blanket because we sit on the grass.',
        },
      ],
      followUp: {
        line: 'Nice. Why do we need it?',
        mood: 'thinking',
        skill: 'reason',
        successLine: "That's a very good reason!",
        targetIntents: [
          {
            id: 'why_thing',
            level: 'target',
            keywords: [
              ['because'],
              ['thirsty'],
              ['drink'],
              ['sit'],
              ['grass'],
              ['so'],
            ],
            model: 'Because I am thirsty.',
          },
        ],
        support: {
          level1: { line: 'Why do we need it? Tell me.', highlight: ['cup', 'blanket'] },
          level2: { line: 'Start with this word.', starter: 'Because ...' },
          fallback: { line: 'Because we are thirsty. Good thinking!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look. What else do we need for a picnic?', highlight: ['cup', 'blanket'] },
        level2: { line: 'Start like this.', starter: 'We need a ...' },
        fallback: { line: 'We need a cup and a blanket. Tap one!', allowTapToContinue: true },
      },
      successLine: 'Into the basket!',
      successAnimation: 'bounce',
      effects: [{ kind: 'collect', objectId: 'cup' }],
    },

    /* ── b3 按顺序洗水果、装篮子（First ... then ...） ─────── */
    {
      id: 'b3_sequence',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'The apple is dirty. What do we do first, and then what?',
      teacherModel: 'First we wash the apple, then we put it in the basket.',
      skill: 'sequence',
      objects: [
        { id: 'basin', art: 'drawn:basin', x: 43, y: 73, correct: true, scale: 1.1 },
        { id: 'apple', art: 'apple', x: 62, y: 68, correct: true },
        { id: 'basket', art: 'basket', x: 82, y: 74, correct: true, scale: 1.25 },
      ],
      targetIntents: [
        {
          id: 'seq_word',
          level: 'basic',
          keywords: [['wash'], ['water'], ['clean'], ['basket']],
          model: 'Wash.',
        },
        {
          id: 'seq_two_step',
          level: 'target',
          keywords: [
            ['first', 'then'],
            ['first', 'after'],
            ['wash', 'then'],
            ['wash', 'basket'],
          ],
          model: 'First we wash the apple, then we put it in the basket.',
        },
        {
          id: 'seq_full',
          level: 'challenge',
          keywords: [['first', 'wash', 'then', 'basket']],
          model: 'First we wash the apple, then we put it in the basket.',
        },
      ],
      followUp: {
        line: 'And then? What happens next?',
        mood: 'waiting',
        skill: 'sequence',
        successLine: 'You told me the whole order. Well done!',
        targetIntents: [
          {
            id: 'seq_then',
            level: 'target',
            keywords: [['then'], ['basket'], ['after'], ['next'], ['put']],
            model: 'Then we put it in the basket.',
          },
        ],
        support: {
          level1: { line: 'What comes after washing?', highlight: ['basket'] },
          level2: { line: 'Start with this word.', starter: 'Then we ...' },
          fallback: { line: 'Then we put it in the basket!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'First the water, then the basket. Can you tell me?', highlight: ['basin', 'basket'] },
        level2: { line: 'Start like this.', starter: 'First we ...', pictureCards: ['basin', 'apple', 'basket'] },
        fallback: { line: 'First we wash the apple, then we put it in the basket.', allowTapToContinue: true },
      },
      successLine: 'Clean and packed! Our basket is ready.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'apple' }],
    },

    /* ── b4 下雨了：预测 + 原因 ───────────────────────────── */
    {
      id: 'b4_rain',
      mood: 'surprised',
      characterAnimation: 'shrug',
      promptLine: 'Oh no! Look at the sky. It is raining! What do we need now?',
      skill: 'predict',
      objects: [
        { id: 'umbrella', art: 'umbrella', x: 42, y: 70, correct: true },
        { id: 'coat', art: 'coat', x: 58, y: 77, correct: true },
        { id: 'flower', art: 'flower', x: 74, y: 70, correct: false },
        { id: 'basket', art: 'basket', x: 90, y: 66, scale: 1.2 },
      ],
      targetIntents: [
        {
          id: 'rain_word',
          level: 'basic',
          keywords: [['umbrella'], ['coat'], ['raincoat'], ['rain'], ['jacket']],
          model: 'Umbrella.',
        },
        {
          id: 'rain_sentence',
          level: 'target',
          keywords: [
            ['need', 'umbrella|coat|raincoat|jacket'],
            ['take', 'umbrella|coat|raincoat|jacket'],
            ['want', 'umbrella|coat|raincoat|jacket'],
            ['bring', 'umbrella|coat|raincoat|jacket'],
          ],
          model: 'We need an umbrella.',
        },
        {
          id: 'rain_reason',
          level: 'challenge',
          keywords: [
            ['because', 'rain|raining|rainy|wet'],
            ['so', 'rain|raining|rainy|wet'],
          ],
          model: 'We need an umbrella because it is raining.',
        },
      ],
      followUp: {
        line: 'Why do we need an umbrella?',
        mood: 'thinking',
        skill: 'reason',
        successLine: 'Exactly! Because it is raining.',
        targetIntents: [
          {
            id: 'because_rain',
            level: 'target',
            // 设计文档 §9 给出的示例接受集
            keywords: [
              ['because', 'rain|raining|rains|rainy'],
              ['raining'],
              ['rainy'],
              ['rain'],
              ['wet'],
            ],
            model: 'Because it is raining.',
          },
        ],
        support: {
          level1: { line: 'Listen. Can you hear the rain? Why do we need it?' },
          level2: { line: 'Start with this word.', starter: 'Because it is ...' },
          fallback: { line: 'Because it is raining!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'It is raining. What keeps us dry?', highlight: ['umbrella', 'coat'] },
        level2: { line: 'Start like this.', starter: 'We need an ...' },
        fallback: { line: 'We need an umbrella. Tap it!', allowTapToContinue: true },
      },
      successLine: 'Got it! Now we are ready for the rain.',
      successAnimation: 'bounce',
      effects: [{ kind: 'weather', to: 'rain' }, { kind: 'hold', objectId: 'umbrella' }],
    },

    /* ── b5 复述：我们带了什么 ────────────────────────────── */
    {
      id: 'b5_retell',
      mood: 'waiting',
      characterAnimation: 'idle',
      promptLine: 'We are ready! Can you tell me what is in our basket?',
      skill: 'retell',
      objects: [
        { id: 'apple', art: 'apple', x: 40, y: 70 },
        { id: 'cup', art: 'cup', x: 54, y: 77 },
        { id: 'blanket', art: 'drawn:blanket', x: 69, y: 79, scale: 0.9 },
        { id: 'umbrella', art: 'umbrella', x: 85, y: 70 },
      ],
      targetIntents: [
        {
          id: 'retell_one',
          level: 'basic',
          keywords: [['apple'], ['cup'], ['blanket'], ['umbrella']],
          model: 'An apple.',
        },
        {
          id: 'retell_two',
          level: 'target',
          keywords: [
            ['apple', 'cup'],
            ['apple', 'blanket'],
            ['apple', 'umbrella'],
            ['cup', 'blanket'],
            ['cup', 'umbrella'],
            ['blanket', 'umbrella'],
            ['and'],
          ],
          model: 'We have an apple and a cup.',
        },
        {
          id: 'retell_three',
          level: 'challenge',
          keywords: [['apple', 'cup', 'blanket|umbrella']],
          model: 'We have an apple, a cup, a blanket and an umbrella.',
        },
      ],
      support: {
        level1: { line: 'Look in the basket. What can you see?', highlight: ['apple', 'cup', 'blanket', 'umbrella'] },
        level2: { line: 'Start like this.', starter: 'We have ...', pictureCards: ['apple', 'cup', 'blanket', 'umbrella'] },
        fallback: { line: 'We have an apple, a cup, a blanket and an umbrella!', allowTapToContinue: true },
      },
      successLine: 'You remembered everything!',
      successAnimation: 'cheer',
      effects: [{ kind: 'backdrop', to: 'meadow' }],
    },
  ],
}
