import type { Scene } from './types'

/**
 * 场景七：小熊去超市（超市）
 *
 * 五个互动任务依次对应 b1..b5：
 *   要买什么 → 按颜色找到它 → 这个还是那个（二选一 + 原因） → 忘了带什么 → 复述购物袋里有什么
 *
 * 这是八个故事里第一个"离开家"的。语言重心放在 request 和 describe，但描述
 * 的角度和收玩具那次不同：收玩具描述的是**找不到的东西长什么样**（回忆），
 * 超市描述的是**眼前这一堆里要哪一个**（辨认）。颜色和大小在这里是筛选条件，
 * 不是装饰词。
 *
 * 关键词表同样写得宽松。`confidence` 不参与判定（设计文档 §8.1）。
 */
export const shopping: Scene = {
  id: 'shopping',
  title: '小熊去超市',
  subtitle: '推着购物车，告诉小熊要买哪一样、为什么要它',
  backdrop: 'supermarket',
  sticker: 'shopping',
  openingLine: "Here we are at the shop! I have my cart. Will you help me find what we need?",
  closingLine: "Our cart is full! Thank you for shopping with me. You told me exactly what to get!",

  beats: [
    /* ── b1 要买什么 ─────────────────────────────────────── */
    {
      id: 'b1_what_to_buy',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'So many things here! What should we put in the cart?',
      teacherModel: "You can say: Let's get the apple.",
      requireSelection: 1,
      skill: 'request',
      objects: [
        { id: 'apple', art: 'apple', x: 39, y: 70, correct: true },
        { id: 'cheese', art: 'cheese', x: 53, y: 77, correct: true },
        { id: 'orange', art: 'orange', x: 67, y: 70, correct: true },
        { id: 'teddy', art: 'teddy', x: 80, y: 77, correct: false },
        // cart 的 OpenMoji 图形在自己画布里留白很多，要放得比别的物件更大才等身
        { id: 'cart', art: 'cart', x: 89, y: 68, scale: 1.45 },
      ],
      targetIntents: [
        {
          id: 'buy_word',
          level: 'basic',
          keywords: [['apple'], ['cheese'], ['orange'], ['food'], ['that']],
          model: 'Apple.',
        },
        {
          id: 'buy_sentence',
          level: 'target',
          keywords: [
            ['get', 'apple|cheese|orange'],
            ['buy', 'apple|cheese|orange'],
            ['want', 'apple|cheese|orange'],
            ['need', 'apple|cheese|orange'],
            ['put', 'apple|cheese|orange'],
          ],
          model: "Let's get the apple.",
        },
        {
          id: 'buy_reason',
          level: 'challenge',
          keywords: [['because', 'hungry|yummy|like|eat|breakfast|dinner']],
          model: "Let's get the apple because I like apples.",
        },
      ],
      followUp: {
        line: "Good! Say it in a big sentence for me. Let's get the ...",
        mood: 'waiting',
        skill: 'request',
        successLine: 'Into the cart it goes!',
        targetIntents: [
          {
            id: 'buy_sentence_fu',
            level: 'target',
            keywords: [
              ['get', 'apple|cheese|orange'],
              ['buy', 'apple|cheese|orange'],
              ['want', 'apple|cheese|orange'],
              ["let's|lets|let us"],
            ],
            model: "Let's get the apple.",
          },
        ],
        support: {
          level1: { line: "Try with me. Let's get the ... what?", highlight: ['apple', 'cheese', 'orange'] },
          level2: { line: 'Start like this.', starter: "Let's get the ..." },
          fallback: { line: "Let's get the apple. Your turn next time!", allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look at the shelf. What shall we buy?', highlight: ['apple', 'cheese', 'orange'] },
        level2: { line: 'You can start like this.', starter: "Let's get the ..." },
        fallback: { line: "Let's get the apple. Tap the one you want!", allowTapToContinue: true },
      },
      successLine: 'Good choice! In the cart.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'apple' }],
    },

    /* ── b2 按颜色找：描述作为筛选条件 ─────────────────────── */
    {
      id: 'b2_find_by_colour',
      mood: 'confused',
      characterAnimation: 'shrug',
      promptLine: 'I need the red one, but I cannot see it. Which one is red?',
      requireSelection: 1,
      skill: 'describe',
      objects: [
        { id: 'tomato', art: 'tomato', x: 40, y: 70, correct: true },
        { id: 'carrot', art: 'carrot', x: 55, y: 77, correct: false },
        { id: 'watermelon', art: 'watermelon', x: 70, y: 70, correct: false },
        { id: 'cart', art: 'cart', x: 88, y: 71, scale: 1.45 },
      ],
      targetIntents: [
        {
          id: 'colour_word',
          level: 'basic',
          keywords: [['tomato'], ['red'], ['this'], ['that'], ['here']],
          model: 'The tomato.',
        },
        {
          id: 'colour_phrase',
          level: 'target',
          keywords: [
            ['red', 'tomato'],
            ['tomato', 'is|its'],
            ['this|that', 'red'],
          ],
          model: 'The tomato is red.',
        },
        {
          id: 'colour_full',
          level: 'challenge',
          keywords: [
            ['red', 'tomato', 'orange|green|carrot|watermelon'],
            ['tomato', 'red', 'not'],
          ],
          model: 'The tomato is red, and the carrot is orange.',
        },
      ],
      followUp: {
        line: 'Clever! And what colour is the carrot?',
        mood: 'thinking',
        skill: 'describe',
        successLine: 'You know all your colours!',
        targetIntents: [
          {
            id: 'carrot_colour',
            level: 'target',
            keywords: [['orange'], ['carrot', 'is|its'], ['yellow']],
            model: 'The carrot is orange.',
          },
        ],
        support: {
          level1: { line: 'Look at the carrot. What colour is it?', highlight: ['carrot'] },
          level2: { line: 'Start like this.', starter: 'The carrot is ...' },
          fallback: { line: 'The carrot is orange!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'One of them is red like an apple. Which one?', highlight: ['tomato'] },
        level2: { line: 'Start like this.', starter: 'The ... is red.' },
        fallback: { line: 'The tomato is red. Tap it!', allowTapToContinue: true },
      },
      successLine: 'That is the one! Thank you.',
      successAnimation: 'bounce',
      effects: [{ kind: 'collect', objectId: 'tomato' }],
    },

    /* ── b3 大的还是小的：二选一 + 原因 ────────────────────── */
    {
      id: 'b3_which_one',
      mood: 'waiting',
      characterAnimation: 'idle',
      promptLine: 'We can only take one melon. Do you want the big one or the small one?',
      teacherModel: 'You can say: I want the big one because we are hungry.',
      skill: 'describe',
      objects: [
        { id: 'watermelon', art: 'watermelon', x: 41, y: 70, correct: true, scale: 1.5 },
        { id: 'orange', art: 'orange', x: 60, y: 74, correct: true, scale: 0.75 },
        { id: 'cart', art: 'cart', x: 84, y: 71, scale: 1.45 },
      ],
      targetIntents: [
        {
          id: 'size_word',
          level: 'basic',
          keywords: [['big'], ['small'], ['little'], ['this'], ['that']],
          model: 'Big.',
        },
        {
          id: 'size_phrase',
          level: 'target',
          keywords: [
            ['want', 'big|small|little'],
            ['take', 'big|small|little'],
            ['the', 'big|small|little', 'one'],
          ],
          model: 'I want the big one.',
        },
        {
          id: 'size_reason',
          level: 'challenge',
          keywords: [
            ['because', 'hungry|share|big|small|sweet|more|everyone'],
            ['so', 'share|everyone|more'],
          ],
          model: 'I want the big one because we can share it.',
        },
      ],
      followUp: {
        line: 'Tell me why you picked that one.',
        mood: 'thinking',
        skill: 'reason',
        successLine: 'That is a very good reason!',
        targetIntents: [
          {
            id: 'why_size',
            level: 'target',
            keywords: [['because'], ['hungry'], ['share'], ['sweet'], ['more'], ['everyone'], ['so']],
            model: 'Because we can share it.',
          },
        ],
        support: {
          level1: { line: 'Why that one and not the other?' },
          level2: { line: 'Start with this word.', starter: 'Because ...' },
          fallback: { line: 'Because we can share it. Good thinking!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'One is big, one is small. Which do you want?', highlight: ['watermelon', 'orange'] },
        level2: { line: 'Start like this.', starter: 'I want the ...' },
        fallback: { line: 'I want the big one. Tap the one you like!', allowTapToContinue: true },
      },
      successLine: 'Good pick! Into the cart.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'watermelon' }],
    },

    /* ── b4 忘了带什么：预测 ──────────────────────────────── */
    {
      id: 'b4_forgot',
      mood: 'surprised',
      characterAnimation: 'shrug',
      promptLine: 'Oh no! The cart is full but I cannot carry it all home. What did I forget?',
      skill: 'predict',
      objects: [
        { id: 'bag', art: 'bag', x: 41, y: 70, correct: true },
        { id: 'cup', art: 'cup', x: 57, y: 77, correct: false },
        { id: 'flower', art: 'flower', x: 72, y: 70, correct: false },
        { id: 'cart', art: 'cart', x: 89, y: 71, scale: 1.45 },
      ],
      targetIntents: [
        {
          id: 'bag_word',
          level: 'basic',
          keywords: [['bag'], ['carry'], ['that'], ['basket']],
          model: 'A bag.',
        },
        {
          id: 'bag_sentence',
          level: 'target',
          keywords: [
            ['need', 'bag|basket'],
            ['forgot', 'bag|basket'],
            ['want', 'bag|basket'],
            ['take', 'bag|basket'],
          ],
          model: 'You need a bag.',
        },
        {
          id: 'bag_reason',
          level: 'challenge',
          keywords: [
            ['because', 'carry|heavy|home|hold|hands'],
            ['so', 'carry|home|hold'],
          ],
          model: 'You need a bag because you have to carry it home.',
        },
      ],
      followUp: {
        line: 'Why do I need it?',
        mood: 'thinking',
        skill: 'reason',
        successLine: 'Exactly! My paws are full.',
        targetIntents: [
          {
            id: 'why_bag',
            level: 'target',
            keywords: [['because'], ['carry'], ['heavy'], ['home'], ['hold'], ['hands'], ['paws']],
            model: 'Because you have to carry it home.',
          },
        ],
        support: {
          level1: { line: 'Look at my paws. How will I carry all this?' },
          level2: { line: 'Start with this word.', starter: 'Because you ...' },
          fallback: { line: 'Because I have to carry it all home!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Something to put the shopping in. What is it?', highlight: ['bag'] },
        level2: { line: 'Start like this.', starter: 'You need a ...' },
        fallback: { line: 'I need a bag. Tap it!', allowTapToContinue: true },
      },
      successLine: 'Got it! Now everything fits.',
      successAnimation: 'bounce',
      effects: [{ kind: 'hold', objectId: 'bag' }],
    },

    /* ── b5 复述：袋子里有什么 ────────────────────────────── */
    {
      id: 'b5_retell',
      mood: 'happy',
      characterAnimation: 'wave',
      promptLine: 'Time to go home! Can you tell me what we bought today?',
      skill: 'retell',
      objects: [
        { id: 'apple', art: 'apple', x: 39, y: 70 },
        { id: 'tomato', art: 'tomato', x: 54, y: 77 },
        { id: 'watermelon', art: 'watermelon', x: 69, y: 70 },
        { id: 'bag', art: 'bag', x: 85, y: 77 },
      ],
      targetIntents: [
        {
          id: 'retell_one_item',
          level: 'basic',
          keywords: [['apple'], ['tomato'], ['melon'], ['watermelon'], ['bag']],
          model: 'An apple.',
        },
        {
          id: 'retell_two_items',
          level: 'target',
          keywords: [
            ['apple', 'tomato'],
            ['apple', 'melon|watermelon'],
            ['tomato', 'melon|watermelon'],
            ['and'],
          ],
          model: 'We bought an apple and a tomato.',
        },
        {
          id: 'retell_three_items',
          level: 'challenge',
          keywords: [['apple', 'tomato', 'melon|watermelon']],
          model: 'We bought an apple, a tomato and a big melon.',
        },
      ],
      support: {
        level1: { line: 'Look in the bag. What did we buy?', highlight: ['apple', 'tomato', 'watermelon'] },
        level2: { line: 'Start like this.', starter: 'We bought ...', pictureCards: ['apple', 'tomato', 'watermelon'] },
        fallback: { line: 'We bought an apple, a tomato and a big melon!', allowTapToContinue: true },
      },
      successLine: 'You remembered the whole list!',
      successAnimation: 'cheer',
    },
  ],
}
