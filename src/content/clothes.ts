import type { Scene } from './types'

/**
 * 场景二：小熊的衣服出了问题（设计文档 §5.2）
 *
 * b1 看天气选衣服 → b2 说明原因 → b3 试穿 → b4 太小了的意外 → b5 自己提替代方案
 *
 * 这一场刻意把"意外"放在 b4：孩子已经做对了一次选择，衣服却不合身。
 * 目的是逼出协商与替代方案，而不是再考一次词汇。
 */
export const clothes: Scene = {
  id: 'clothes',
  title: '小熊的衣服出了问题',
  subtitle: '看看天气，帮小熊挑一身合适的衣服',
  backdrop: 'bedroom',
  weather: 'rain',
  sticker: 'raincoat',
  openingLine: "Good morning! I want to go outside. But what should I wear today?",
  closingLine: "Now I am dry and warm. You helped me choose. Thank you, my friend!",

  beats: [
    /* ── b1 看天气选衣服 ─────────────────────────────────── */
    {
      id: 'b1_weather_pick',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'Look out the window. It is rainy today. What are you going to wear?',
      teacherModel: 'You can say: I am going to wear the coat.',
      requireSelection: 1,
      skill: 'describe',
      objects: [
        { id: 'coat', art: 'coat', x: 22, y: 62, correct: true },
        { id: 'boots', art: 'boots', x: 41, y: 70, correct: true },
        { id: 'sunglasses', art: 'sunglasses', x: 60, y: 62, correct: false },
        { id: 'shorts', art: 'shorts', x: 78, y: 70, correct: false },
        { id: 'rain', art: 'rain', x: 88, y: 24, scale: 1.2 },
      ],
      targetIntents: [
        {
          id: 'clothes_word',
          level: 'basic',
          keywords: [['coat'], ['raincoat'], ['jacket'], ['boots'], ['boot'], ['shoes']],
          model: 'Coat.',
        },
        {
          id: 'clothes_sentence',
          level: 'target',
          keywords: [
            ['wear', 'coat|raincoat|jacket|boots|boot'],
            ['going', 'coat|raincoat|jacket|boots|boot'],
            ['want', 'coat|raincoat|jacket|boots|boot'],
            ['put on', 'coat|raincoat|jacket|boots|boot'],
          ],
          model: 'I am going to wear the coat.',
        },
        {
          id: 'clothes_reason',
          level: 'challenge',
          keywords: [
            ['because', 'rain|raining|rainy|wet|cold'],
            ['so', 'rain|raining|rainy|wet|cold'],
          ],
          model: 'I am going to wear the coat because it is rainy.',
        },
      ],
      followUp: {
        line: 'Say it in a big sentence. I am going to wear ...',
        mood: 'waiting',
        skill: 'describe',
        successLine: 'A good choice for a rainy day!',
        targetIntents: [
          {
            id: 'wear_sentence_fu',
            level: 'target',
            keywords: [['wear'], ['going'], ['put on'], ['i am|im|i will|ill']],
            model: 'I am going to wear the coat.',
          },
        ],
        support: {
          level1: { line: 'What are you going to wear?', highlight: ['coat', 'boots'] },
          level2: { line: 'Start like this.', starter: 'I am going to wear ...' },
          fallback: { line: 'I am going to wear the coat!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Listen to the rain. Which clothes keep us dry?', highlight: ['coat', 'boots'] },
        level2: { line: 'Start like this.', starter: 'I am going to wear ...' },
        fallback: { line: 'I am going to wear the coat. Tap the clothes!', allowTapToContinue: true },
      },
      successLine: 'Good idea!',
      successAnimation: 'bounce',
      effects: [{ kind: 'wear', objectId: 'coat' }],
    },

    /* ── b2 为什么合适 ───────────────────────────────────── */
    {
      id: 'b2_why',
      mood: 'thinking',
      characterAnimation: 'idle',
      promptLine: 'Why is the coat a good choice today?',
      skill: 'reason',
      objects: [
        { id: 'rain', art: 'rain', x: 30, y: 30, scale: 1.3 },
        { id: 'coat', art: 'coat', x: 62, y: 62, correct: true },
      ],
      targetIntents: [
        {
          id: 'why_word',
          level: 'basic',
          keywords: [['rain'], ['raining'], ['rainy'], ['wet'], ['cold'], ['dry']],
          model: 'Rainy.',
        },
        {
          id: 'why_sentence',
          level: 'target',
          keywords: [
            ['because', 'rain|raining|rainy|wet|cold'],
            ['so', 'rain|raining|rainy|wet|cold'],
            ['keep', 'dry|warm'],
          ],
          model: 'Because it is rainy.',
        },
        {
          id: 'why_full',
          level: 'challenge',
          keywords: [
            ['because', 'rain|raining|rainy', 'dry|wet|warm'],
            ['rainy', 'so', 'need|wear'],
          ],
          model: 'It is rainy, so the coat keeps me dry.',
        },
      ],
      support: {
        level1: { line: 'Look at the sky. How is the weather?' },
        level2: { line: 'Start with this word.', starter: 'Because it is ...' },
        fallback: { line: 'Because it is rainy! The coat keeps me dry.', allowTapToContinue: true },
      },
      successLine: 'That is right. The coat keeps me dry.',
      successAnimation: 'cheer',
    },

    /* ── b3 试穿 ────────────────────────────────────────── */
    {
      id: 'b3_try_on',
      mood: 'waiting',
      characterAnimation: 'idle',
      promptLine: 'Can I try it on now? Ask me nicely and I will put it on.',
      skill: 'request',
      objects: [
        { id: 'coat', art: 'coat', x: 34, y: 64, correct: true },
        { id: 'hat', art: 'hat', x: 62, y: 62, correct: true },
      ],
      targetIntents: [
        {
          id: 'try_word',
          level: 'basic',
          keywords: [['try'], ['on'], ['wear'], ['yes'], ['put']],
          model: 'Try it on.',
        },
        {
          id: 'try_sentence',
          level: 'target',
          keywords: [
            ['try', 'on'],
            ['put', 'on'],
            ['can', 'try'],
            ['please'],
          ],
          model: 'Can I try it on, please?',
        },
        {
          id: 'try_polite',
          level: 'challenge',
          keywords: [
            ['can|could', 'try|put', 'please'],
          ],
          model: 'Could you try it on, please?',
        },
      ],
      support: {
        level1: { line: 'Ask me to try it on.', highlight: ['coat'] },
        level2: { line: 'Start like this.', starter: 'Can I try it ...' },
        fallback: { line: 'Can I try it on, please? Let me try!', allowTapToContinue: true },
      },
      successLine: 'Here I go... look at me!',
      successAnimation: 'cheer',
      effects: [{ kind: 'wear', objectId: 'coat' }],
    },

    /* ── b4 意外：太小了 ─────────────────────────────────── */
    {
      id: 'b4_too_small',
      mood: 'sad',
      characterAnimation: 'shrug',
      promptLine: 'Oh! Something is wrong. Look at the coat on me. How does it feel?',
      teacherModel: 'You can say: This one is too small.',
      skill: 'describe',
      objects: [
        { id: 'coat', art: 'coat', x: 34, y: 64, correct: true, scale: 0.62 },
        { id: 'tshirt', art: 'tshirt', x: 66, y: 66, correct: false },
      ],
      targetIntents: [
        {
          id: 'size_word',
          level: 'basic',
          keywords: [['small'], ['big'], ['tight'], ['short'], ['no']],
          model: 'Too small.',
        },
        {
          id: 'size_sentence',
          level: 'target',
          keywords: [
            ['too', 'small|big|tight|short'],
            ['this', 'small|big'],
            ['it is|its', 'small|big'],
          ],
          model: 'This one is too small.',
        },
        {
          id: 'size_full',
          level: 'challenge',
          keywords: [['too', 'small|big', 'need|another|other|bigger|new']],
          model: 'This one is too small. We need a bigger one.',
        },
      ],
      followUp: {
        line: 'You are right. So what should we do?',
        mood: 'thinking',
        skill: 'predict',
        successLine: 'Good thinking! Let us find another one.',
        targetIntents: [
          {
            id: 'fix_idea',
            level: 'target',
            keywords: [
              ['bigger'],
              ['another'],
              ['other'],
              ['new'],
              ['change'],
              ['different'],
              ['find'],
            ],
            model: 'We need a bigger one.',
          },
        ],
        support: {
          level1: { line: 'The coat is too small. What can we do?' },
          level2: { line: 'Start like this.', starter: 'We need a ...' },
          fallback: { line: 'We need a bigger one!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look, it does not fit. Is it too big or too small?', highlight: ['coat'] },
        level2: { line: 'Start like this.', starter: 'This one is too ...' },
        fallback: { line: 'This one is too small!', allowTapToContinue: true },
      },
      successLine: 'You noticed! It really is too small.',
      successAnimation: 'shrug',
    },

    /* ── b5 自己提替代方案 ──────────────────────────────── */
    {
      id: 'b5_alternative',
      mood: 'waiting',
      characterAnimation: 'lean',
      promptLine: 'Here are my other clothes. What else can I wear in the rain?',
      skill: 'predict',
      objects: [
        { id: 'hat', art: 'hat', x: 20, y: 62, correct: true },
        { id: 'boots', art: 'boots', x: 38, y: 70, correct: true },
        { id: 'scarf', art: 'scarf', x: 56, y: 62, correct: true },
        { id: 'umbrella', art: 'umbrella', x: 74, y: 68, correct: true },
        { id: 'socks', art: 'socks', x: 88, y: 62, correct: false },
      ],
      targetIntents: [
        {
          id: 'alt_word',
          level: 'basic',
          keywords: [['hat'], ['boots'], ['boot'], ['scarf'], ['umbrella']],
          model: 'Boots.',
        },
        {
          id: 'alt_sentence',
          level: 'target',
          keywords: [
            ['wear', 'hat|boots|boot|scarf'],
            ['take', 'umbrella|hat|boots|scarf'],
            ['need', 'umbrella|hat|boots|scarf'],
            ['can', 'hat|boots|scarf|umbrella'],
          ],
          model: 'You can wear the boots.',
        },
        {
          id: 'alt_reason',
          level: 'challenge',
          keywords: [
            ['because', 'rain|raining|rainy|wet|dry|cold'],
            ['so', 'rain|raining|rainy|wet|dry'],
          ],
          model: 'You can wear the boots because the ground is wet.',
        },
      ],
      followUp: {
        line: 'Why that one?',
        mood: 'thinking',
        skill: 'reason',
        successLine: 'You explained it so well!',
        targetIntents: [
          {
            id: 'alt_why',
            level: 'target',
            keywords: [['because'], ['rain'], ['raining'], ['wet'], ['dry'], ['cold'], ['warm'], ['so']],
            model: 'Because it is raining.',
          },
        ],
        support: {
          level1: { line: 'Tell me why.' },
          level2: { line: 'Start with this word.', starter: 'Because ...' },
          fallback: { line: 'Because it is raining outside!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look at all my clothes. Which one is good for rain?', highlight: ['boots', 'hat', 'umbrella'] },
        level2: { line: 'Start like this.', starter: 'You can wear ...' },
        fallback: { line: 'You can wear the boots!', allowTapToContinue: true },
      },
      successLine: 'Perfect! Now I am ready to go outside.',
      successAnimation: 'cheer',
      effects: [{ kind: 'wear', objectId: 'boots' }, { kind: 'backdrop', to: 'meadow' }],
    },
  ],
}
