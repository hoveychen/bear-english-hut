import type { Scene } from './types'

/**
 * 场景四：小熊做早餐（厨房）
 *
 * 五个互动任务依次对应 b1..b5：
 *   选早餐食物 → 选要用的厨具 → 按顺序做（First...then） → 少了点什么（预测） → 复述整顿早餐
 *
 * 技能重心是 request 和 sequence：厨房天然是"一步接一步"的场地，
 * 比野餐篮更适合把 First ... then ... 说满两句。
 *
 * 关键词表同样写得宽松 —— 5 岁孩子会把 bread 说成 bed、把 egg 说成 ag，
 * 这些都要能过。`confidence` 不参与判定（设计文档 §8.1）。
 */
export const breakfast: Scene = {
  id: 'breakfast',
  title: '小熊做早餐',
  subtitle: '和小熊一起煎蛋、烤面包，把做早餐的顺序讲出来',
  backdrop: 'kitchen',
  sticker: 'breakfast',
  openingLine: "Good morning! I am so hungry. Will you help me make breakfast?",
  closingLine: "Breakfast is ready! Thank you for cooking with me. You said so many words today!",

  beats: [
    /* ── b1 选早餐食物 ───────────────────────────────────── */
    {
      id: 'b1_choose_food',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'My kitchen is full of food. What should we eat for breakfast?',
      teacherModel: "You can say: Let's eat the egg.",
      requireSelection: 1,
      skill: 'request',
      objects: [
        { id: 'egg', art: 'egg', x: 38, y: 64, correct: true },
        { id: 'bread', art: 'bread', x: 52, y: 70, correct: true },
        { id: 'milk', art: 'milk', x: 66, y: 64, correct: true },
        { id: 'ball', art: 'ball', x: 80, y: 70, correct: false },
        { id: 'plate', art: 'plate', x: 91, y: 62, scale: 1.2 },
      ],
      targetIntents: [
        {
          id: 'breakfast_word',
          level: 'basic',
          keywords: [['egg'], ['eggs'], ['bread'], ['toast'], ['milk'], ['food'], ['breakfast']],
          model: 'Egg.',
        },
        {
          id: 'breakfast_sentence',
          level: 'target',
          keywords: [
            ['eat', 'egg|eggs|bread|toast|milk'],
            ['want', 'egg|eggs|bread|toast|milk'],
            ['make', 'egg|eggs|bread|toast|milk'],
            ['have', 'egg|eggs|bread|toast|milk'],
            ['drink', 'milk'],
          ],
          model: "Let's eat the egg.",
        },
        {
          id: 'breakfast_reason',
          level: 'challenge',
          keywords: [['because', 'hungry|yummy|good|like|eat|breakfast']],
          model: "Let's eat the egg because I am hungry.",
        },
      ],
      followUp: {
        line: "Good! Can you say it in a big sentence? Let's eat the ...",
        mood: 'waiting',
        skill: 'request',
        successLine: "Let's eat it! I will get the pan.",
        targetIntents: [
          {
            id: 'breakfast_sentence_fu',
            level: 'target',
            keywords: [
              ['eat', 'egg|eggs|bread|toast|milk'],
              ['want', 'egg|eggs|bread|toast|milk'],
              ['make', 'egg|eggs|bread|toast|milk'],
              ["let's|lets|let us"],
            ],
            model: "Let's eat the egg.",
          },
        ],
        support: {
          level1: { line: "Try with me. Let's eat the ... what?", highlight: ['egg', 'bread', 'milk'] },
          level2: { line: 'Start like this.', starter: "Let's eat the ..." },
          fallback: { line: "Let's eat the egg. Your turn next time!", allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look at the food. What do you want for breakfast?', highlight: ['egg', 'bread', 'milk'] },
        level2: { line: 'You can start like this.', starter: "Let's eat the ..." },
        fallback: { line: "Let's eat the egg. Tap the food you like!", allowTapToContinue: true },
      },
      successLine: 'Yummy! Good choice.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'egg' }],
    },

    /* ── b2 选厨具 ───────────────────────────────────────── */
    {
      id: 'b2_choose_tool',
      mood: 'confused',
      characterAnimation: 'shrug',
      promptLine: 'I cannot cook the egg with my paws! What do we need?',
      requireSelection: 1,
      skill: 'request',
      objects: [
        { id: 'pan', art: 'pan', x: 39, y: 64, correct: true },
        { id: 'bowl', art: 'bowl', x: 53, y: 70, correct: true },
        { id: 'spoon', art: 'spoon', x: 67, y: 64, correct: true },
        { id: 'teddy', art: 'teddy', x: 81, y: 70, correct: false },
        { id: 'egg', art: 'egg', x: 91, y: 62 },
      ],
      targetIntents: [
        {
          id: 'tool_word',
          level: 'basic',
          keywords: [['pan'], ['bowl'], ['spoon'], ['pot'], ['cook'], ['cup']],
          model: 'A pan.',
        },
        {
          id: 'tool_sentence',
          level: 'target',
          keywords: [
            ['need', 'pan|bowl|spoon|pot'],
            ['want', 'pan|bowl|spoon|pot'],
            ['use', 'pan|bowl|spoon|pot'],
            ['take', 'pan|bowl|spoon|pot'],
          ],
          model: 'We need a pan.',
        },
        {
          id: 'tool_reason',
          level: 'challenge',
          keywords: [['because', 'cook|hot|egg|fry|mix|eat|pan']],
          model: 'We need a pan because we cook the egg.',
        },
      ],
      followUp: {
        line: 'Nice. Why do we need it?',
        mood: 'thinking',
        skill: 'reason',
        successLine: 'That is exactly right!',
        targetIntents: [
          {
            id: 'why_tool',
            level: 'target',
            keywords: [['because'], ['cook'], ['fry'], ['hot'], ['mix'], ['eat'], ['so']],
            model: 'Because we cook the egg.',
          },
        ],
        support: {
          level1: { line: 'Why do we need it? Tell me.', highlight: ['pan', 'bowl', 'spoon'] },
          level2: { line: 'Start with this word.', starter: 'Because we ...' },
          fallback: { line: 'Because we cook the egg. Good thinking!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look. What do we cook the egg in?', highlight: ['pan', 'bowl'] },
        level2: { line: 'Start like this.', starter: 'We need a ...' },
        fallback: { line: 'We need a pan. Tap it!', allowTapToContinue: true },
      },
      successLine: 'Here comes the pan!',
      successAnimation: 'bounce',
      effects: [{ kind: 'hold', objectId: 'pan' }],
    },

    /* ── b3 按顺序做早餐（First ... then ...）───────────────── */
    {
      id: 'b3_sequence',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'The pan is hot and the egg is cold. What do we do first, and then what?',
      teacherModel: 'First we cook the egg, then we put it on the plate.',
      skill: 'sequence',
      objects: [
        { id: 'egg', art: 'egg', x: 40, y: 63, correct: true },
        { id: 'pan', art: 'pan', x: 60, y: 68, correct: true, scale: 1.15 },
        { id: 'plate', art: 'plate', x: 81, y: 66, correct: true, scale: 1.2 },
      ],
      targetIntents: [
        {
          id: 'cook_word',
          level: 'basic',
          keywords: [['cook'], ['fry'], ['pan'], ['plate'], ['hot']],
          model: 'Cook.',
        },
        {
          id: 'cook_two_step',
          level: 'target',
          keywords: [
            ['first', 'then'],
            ['first', 'after'],
            ['cook', 'then'],
            ['cook', 'plate'],
            ['fry', 'then'],
          ],
          model: 'First we cook the egg, then we put it on the plate.',
        },
        {
          id: 'cook_full',
          level: 'challenge',
          keywords: [['first', 'cook|fry', 'then', 'plate']],
          model: 'First we cook the egg, then we put it on the plate.',
        },
      ],
      followUp: {
        line: 'And then? What happens next?',
        mood: 'waiting',
        skill: 'sequence',
        successLine: 'You told me the whole order. Well done!',
        targetIntents: [
          {
            id: 'cook_then',
            level: 'target',
            keywords: [['then'], ['plate'], ['after'], ['next'], ['put'], ['eat']],
            model: 'Then we put it on the plate.',
          },
        ],
        support: {
          level1: { line: 'What comes after cooking?', highlight: ['plate'] },
          level2: { line: 'Start with this word.', starter: 'Then we ...' },
          fallback: { line: 'Then we put it on the plate!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'First the pan, then the plate. Can you tell me?', highlight: ['pan', 'plate'] },
        level2: { line: 'Start like this.', starter: 'First we ...', pictureCards: ['egg', 'pan', 'plate'] },
        fallback: { line: 'First we cook the egg, then we put it on the plate.', allowTapToContinue: true },
      },
      successLine: 'It smells so good! The egg is ready.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'egg' }],
    },

    /* ── b4 少了点什么：预测 + 原因 ───────────────────────── */
    {
      id: 'b4_missing',
      mood: 'surprised',
      characterAnimation: 'shrug',
      promptLine: 'Oh! My mouth is very dry. Something is missing. What do I need?',
      skill: 'predict',
      objects: [
        { id: 'milk', art: 'milk', x: 41, y: 64, correct: true },
        { id: 'cup', art: 'cup', x: 57, y: 70, correct: true },
        { id: 'socks', art: 'socks', x: 74, y: 64, correct: false },
        { id: 'plate', art: 'plate', x: 90, y: 62, scale: 1.15 },
      ],
      targetIntents: [
        {
          id: 'drink_word',
          level: 'basic',
          keywords: [['milk'], ['cup'], ['water'], ['juice'], ['drink']],
          model: 'Milk.',
        },
        {
          id: 'drink_sentence',
          level: 'target',
          keywords: [
            ['need', 'milk|cup|water|juice|drink'],
            ['want', 'milk|cup|water|juice|drink'],
            ['take', 'milk|cup|water|juice'],
            ['drink', 'milk|water|juice'],
          ],
          model: 'You need some milk.',
        },
        {
          id: 'drink_reason',
          level: 'challenge',
          keywords: [
            ['because', 'thirsty|dry|drink|milk|water'],
            ['so', 'thirsty|dry|drink'],
          ],
          model: 'You need some milk because you are thirsty.',
        },
      ],
      followUp: {
        line: 'Why do I need it?',
        mood: 'thinking',
        skill: 'reason',
        successLine: 'Exactly! Because I am thirsty.',
        targetIntents: [
          {
            id: 'because_thirsty',
            level: 'target',
            keywords: [
              ['because', 'thirsty|dry|drink'],
              ['thirsty'],
              ['dry'],
              ['drink'],
            ],
            model: 'Because you are thirsty.',
          },
        ],
        support: {
          level1: { line: 'My mouth is dry. Why do I need it?' },
          level2: { line: 'Start with this word.', starter: 'Because you are ...' },
          fallback: { line: 'Because I am thirsty!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'My mouth is dry. What can I drink?', highlight: ['milk', 'cup'] },
        level2: { line: 'Start like this.', starter: 'You need some ...' },
        fallback: { line: 'I need some milk. Tap it!', allowTapToContinue: true },
      },
      successLine: 'Glug glug! That is much better.',
      successAnimation: 'bounce',
      effects: [{ kind: 'hold', objectId: 'milk' }],
    },

    /* ── b5 复述：我们做了什么早餐 ────────────────────────── */
    {
      id: 'b5_retell',
      mood: 'waiting',
      characterAnimation: 'idle',
      promptLine: 'Breakfast is ready! Can you tell me what we made?',
      skill: 'retell',
      objects: [
        { id: 'egg', art: 'egg', x: 39, y: 64 },
        { id: 'bread', art: 'bread', x: 54, y: 70 },
        { id: 'milk', art: 'milk', x: 69, y: 64 },
        { id: 'plate', art: 'plate', x: 85, y: 70, scale: 1.15 },
      ],
      targetIntents: [
        {
          id: 'retell_one_food',
          level: 'basic',
          keywords: [['egg'], ['bread'], ['toast'], ['milk'], ['plate']],
          model: 'An egg.',
        },
        {
          id: 'retell_two_food',
          level: 'target',
          keywords: [
            ['egg', 'bread|toast'],
            ['egg', 'milk'],
            ['bread|toast', 'milk'],
            ['and'],
          ],
          model: 'We made an egg and some bread.',
        },
        {
          id: 'retell_three_food',
          level: 'challenge',
          keywords: [['egg', 'bread|toast', 'milk']],
          model: 'We made an egg, some bread and a cup of milk.',
        },
      ],
      support: {
        level1: { line: 'Look at the plate. What can you see?', highlight: ['egg', 'bread', 'milk'] },
        level2: { line: 'Start like this.', starter: 'We made ...', pictureCards: ['egg', 'bread', 'milk'] },
        fallback: { line: 'We made an egg, some bread and a cup of milk!', allowTapToContinue: true },
      },
      successLine: 'You remembered the whole breakfast!',
      successAnimation: 'cheer',
    },
  ],
}
