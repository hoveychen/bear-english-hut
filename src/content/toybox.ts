import type { Scene } from './types'

/**
 * 场景五：小熊收玩具（卧室）
 *
 * 五个互动任务依次对应 b1..b5：
 *   说说地上有什么 → 小车放哪 → 书和积木放哪 → 描述找不到的小熊玩偶 → 复述收了什么
 *
 * 介词这条线刻意和场景三（找球）岔开：
 *   - 找球里的 position 是**猜测**（I think it is under the chair）——说的是东西在哪；
 *   - 这里的 position 是**安置**（Put the car in the box）——说的是东西该去哪。
 * 同一批介词，两种语言功能，孩子要做的事完全不同，所以不算重复练一遍。
 *
 * 关键词表同样写得宽松。`confidence` 不参与判定（设计文档 §8.1）。
 */
export const toybox: Scene = {
  id: 'toybox',
  title: '小熊收玩具',
  subtitle: '房间乱成一团，告诉小熊每样东西该放到哪里去',
  backdrop: 'bedroom',
  sticker: 'toybox',
  openingLine: "Oh dear. Look at my room! Everything is on the floor. Can you help me tidy up?",
  closingLine: "My room is tidy now! Thank you. You told me where everything goes!",

  beats: [
    /* ── b1 说说地上有什么 ───────────────────────────────── */
    {
      id: 'b1_what_you_see',
      mood: 'surprised',
      characterAnimation: 'shrug',
      promptLine: 'My room is such a mess. What can you see on the floor?',
      teacherModel: 'You can say: I can see a car.',
      skill: 'describe',
      objects: [
        { id: 'car', art: 'car', x: 39, y: 70 },
        { id: 'blocks', art: 'drawn:blocks', x: 53, y: 77 },
        { id: 'book', art: 'book', x: 67, y: 70 },
        { id: 'robot', art: 'robot', x: 81, y: 77 },
        { id: 'box', art: 'box', x: 91, y: 67, scale: 1.25 },
      ],
      targetIntents: [
        {
          id: 'toy_word',
          level: 'basic',
          keywords: [['car'], ['blocks'], ['block'], ['book'], ['robot'], ['toy'], ['toys']],
          model: 'A car.',
        },
        {
          id: 'toy_sentence',
          level: 'target',
          keywords: [
            ['see', 'car|blocks|block|book|robot|toy|toys'],
            ['is|are', 'car|blocks|book|robot'],
            ['there', 'car|blocks|book|robot'],
          ],
          model: 'I can see a car.',
        },
        {
          id: 'toy_two_things',
          level: 'challenge',
          keywords: [
            ['car', 'book'],
            ['car', 'robot'],
            ['blocks|block', 'book'],
            ['and', 'car|blocks|book|robot'],
          ],
          model: 'I can see a car and a book.',
        },
      ],
      followUp: {
        line: 'Good! Can you tell me one more thing you see?',
        mood: 'waiting',
        skill: 'describe',
        successLine: 'You found them all!',
        targetIntents: [
          {
            id: 'toy_one_more',
            level: 'target',
            keywords: [['car'], ['blocks'], ['block'], ['book'], ['robot'], ['and'], ['also']],
            model: 'I can see a robot.',
          },
        ],
        support: {
          level1: { line: 'Look again. What else is on the floor?', highlight: ['robot', 'book'] },
          level2: { line: 'Start like this.', starter: 'I can also see a ...' },
          fallback: { line: 'I can see a robot too!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look at the floor. What is there?', highlight: ['car', 'blocks', 'book', 'robot'] },
        level2: { line: 'You can start like this.', starter: 'I can see a ...' },
        fallback: { line: 'I can see a car, some blocks and a book. Tap one!', allowTapToContinue: true },
      },
      successLine: 'You are right. What a mess!',
      successAnimation: 'bounce',
    },

    /* ── b2 小车放哪：in ──────────────────────────────────── */
    {
      id: 'b2_car_in_box',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'Let us start with the car. Where does the car go?',
      teacherModel: 'You can say: Put the car in the box.',
      requireSelection: 1,
      skill: 'position',
      objects: [
        { id: 'car', art: 'car', x: 40, y: 70, correct: true },
        { id: 'box', art: 'box', x: 60, y: 74, correct: true, scale: 1.3 },
        { id: 'bed', art: 'bed', x: 82, y: 71, scale: 1.25 },
      ],
      targetIntents: [
        {
          id: 'in_word',
          level: 'basic',
          keywords: [['box'], ['in'], ['inside'], ['there']],
          // 三档的示范句要各自落在自己那一档：basic 给单词，介词短语是 target
          // 的活，完整祈使句才是 challenge。写成 'In the box.' 会被判成 target。
          model: 'Box.',
        },
        {
          id: 'in_phrase',
          level: 'target',
          keywords: [
            ['in', 'box'],
            ['inside', 'box'],
            ['into', 'box'],
          ],
          model: 'In the box.',
        },
        {
          id: 'in_full',
          level: 'challenge',
          keywords: [
            ['put', 'car', 'in|inside', 'box'],
            ['goes', 'in|inside', 'box'],
          ],
          model: 'Put the car in the box, please.',
        },
      ],
      support: {
        level1: { line: 'The toy box is open. Where does the car go?', highlight: ['box'] },
        level2: { line: 'Start like this.', starter: 'Put the car ...', pictureCards: ['car', 'box'] },
        fallback: { line: 'Put the car in the box. Tap the box!', allowTapToContinue: true },
      },
      successLine: 'In it goes! One toy away.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'car' }],
    },

    /* ── b3 书和积木：on / under 的对比 ────────────────────── */
    {
      id: 'b3_book_and_blocks',
      mood: 'confused',
      characterAnimation: 'shrug',
      promptLine: 'Now the book. It does not go in the toy box. Where does the book go?',
      teacherModel: 'You can say: Put the book on the bed.',
      requireSelection: 1,
      skill: 'position',
      objects: [
        { id: 'book', art: 'book', x: 39, y: 70, correct: true },
        { id: 'bed', art: 'bed', x: 60, y: 73, correct: true, scale: 1.3 },
        { id: 'blocks', art: 'drawn:blocks', x: 80, y: 70 },
        { id: 'box', art: 'box', x: 91, y: 76, scale: 1.1 },
      ],
      targetIntents: [
        {
          id: 'on_word',
          level: 'basic',
          keywords: [['bed'], ['on'], ['under'], ['there']],
          model: 'The bed.',
        },
        {
          id: 'on_phrase',
          level: 'target',
          keywords: [
            ['on', 'bed'],
            ['under', 'bed'],
            ['next to', 'bed'],
            ['beside', 'bed'],
          ],
          model: 'On the bed.',
        },
        {
          id: 'on_full',
          level: 'challenge',
          keywords: [
            ['put', 'book', 'on|under|next', 'bed'],
            ['goes', 'on|under', 'bed'],
          ],
          model: 'Put the book on the bed, please.',
        },
      ],
      followUp: {
        line: 'And the blocks? Do they go on the bed too?',
        mood: 'thinking',
        skill: 'position',
        successLine: 'Right! The blocks go in the box, not on the bed.',
        targetIntents: [
          {
            id: 'blocks_in_box',
            level: 'target',
            keywords: [
              ['box'],
              ['in', 'box'],
              ['no'],
              ['not'],
            ],
            model: 'No, the blocks go in the box.',
          },
        ],
        support: {
          level1: { line: 'Blocks are toys. Where do toys go?', highlight: ['box'] },
          level2: { line: 'Start with this word.', starter: 'The blocks go ...' },
          fallback: { line: 'The blocks go in the box!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'A book is not a toy. Where do we read it?', highlight: ['bed'] },
        level2: { line: 'Start like this.', starter: 'Put the book ...', pictureCards: ['book', 'bed'] },
        fallback: { line: 'Put the book on the bed. Tap the bed!', allowTapToContinue: true },
      },
      successLine: 'On the bed it goes. Now I can read it tonight!',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'blocks' }],
    },

    /* ── b4 找不到的玩偶：描述它长什么样 ───────────────────── */
    {
      id: 'b4_describe_teddy',
      mood: 'sad',
      characterAnimation: 'idle',
      promptLine: 'Wait! I cannot find my teddy. Can you tell me what my teddy looks like?',
      teacherModel: 'You can say: It is small and brown.',
      skill: 'describe',
      objects: [
        { id: 'teddy', art: 'teddy', x: 42, y: 71, hidden: true },
        { id: 'bed', art: 'bed', x: 62, y: 73, scale: 1.3 },
        { id: 'box', art: 'box', x: 84, y: 72, scale: 1.15 },
      ],
      targetIntents: [
        {
          id: 'teddy_word',
          level: 'basic',
          keywords: [['brown'], ['small'], ['little'], ['soft'], ['bear'], ['teddy'], ['cute']],
          model: 'Brown.',
        },
        {
          id: 'teddy_phrase',
          level: 'target',
          keywords: [
            ['is|its|it is', 'brown|small|little|soft|cute'],
            ['brown', 'bear|teddy'],
            ['small', 'bear|teddy'],
          ],
          model: 'It is small and brown.',
        },
        {
          id: 'teddy_two_words',
          level: 'challenge',
          // challenge 要比 target 多要一样东西：target 的示范是「小而棕」两个
          // 形容词，所以挑战档必须再带上材质或身份（soft / bear），否则两档等价。
          keywords: [
            ['small|little', 'brown', 'soft|bear|cute'],
            ['brown', 'soft'],
            ['small|little', 'soft'],
          ],
          model: 'It is a small brown bear and it is very soft.',
        },
      ],
      support: {
        level1: { line: 'Is it big or small? What colour is it?' },
        level2: { line: 'Start like this.', starter: 'It is ...' },
        fallback: { line: 'It is small and brown. Let us look under the bed!', allowTapToContinue: true },
      },
      successLine: 'That is my teddy! There it is, under the bed!',
      successAnimation: 'cheer',
      effects: [{ kind: 'reveal', objectId: 'teddy' }],
    },

    /* ── b5 复述：我们收了什么 ────────────────────────────── */
    {
      id: 'b5_retell',
      mood: 'happy',
      characterAnimation: 'wave',
      promptLine: 'My room is tidy! Can you tell me what we put away?',
      skill: 'retell',
      objects: [
        { id: 'car', art: 'car', x: 39, y: 70 },
        { id: 'blocks', art: 'drawn:blocks', x: 54, y: 77 },
        { id: 'book', art: 'book', x: 69, y: 70 },
        { id: 'teddy', art: 'teddy', x: 85, y: 77 },
      ],
      targetIntents: [
        {
          id: 'retell_one_toy',
          level: 'basic',
          keywords: [['car'], ['blocks'], ['block'], ['book'], ['teddy'], ['bear']],
          model: 'The car.',
        },
        {
          id: 'retell_two_toys',
          level: 'target',
          keywords: [
            ['car', 'blocks|block'],
            ['car', 'book'],
            ['car', 'teddy|bear'],
            ['blocks|block', 'book'],
            ['book', 'teddy|bear'],
            ['and'],
          ],
          model: 'We put away the car and the blocks.',
        },
        {
          id: 'retell_three_toys',
          level: 'challenge',
          keywords: [['car', 'blocks|block', 'book|teddy|bear']],
          model: 'We put away the car, the blocks, the book and my teddy.',
        },
      ],
      support: {
        level1: { line: 'Look around. What did we put away?', highlight: ['car', 'blocks', 'book', 'teddy'] },
        level2: { line: 'Start like this.', starter: 'We put away ...', pictureCards: ['car', 'drawn:blocks', 'book', 'teddy'] },
        fallback: { line: 'We put away the car, the blocks, the book and my teddy!', allowTapToContinue: true },
      },
      successLine: 'You remembered every single one!',
      successAnimation: 'cheer',
    },
  ],
}
