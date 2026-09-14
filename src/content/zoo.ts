import type { Scene } from './types'

/**
 * 场景八：小熊逛动物园（动物园）
 *
 * 五个互动任务依次对应 b1..b5：
 *   看见了什么 → 它长什么样 → 它躲在哪里 → 喂它吃什么 → 复述今天看了哪些动物
 *
 * 动物摆在栅栏**前面**而不是后面：可操作物品必须在前景才点得到，而 backdrop
 * 永远在最底层，没法把栅栏压到物品之上。所以栅栏是园区的围栏，不是"隔着看"
 * 的那道栏杆——文案也照这个写，别让画面和台词各说各的。
 *
 * 这是整段旅程的最后一站，所以刻意把前面练过的都收一遍：describe（b1/b2）、
 * position（b3）、request 与 reason（b4）、retell（b5）。不引入新技能——
 * 最后一个故事该是"我全都会说了"，不是又一道新题。
 *
 * 动物名是八个故事里最长的一批词（elephant / giraffe / penguin），所以
 * basic 档特意收得很宽：只要说出任何一个动物名、或者 big / long / tall
 * 这类形容词，就算听懂了任务。
 *
 * 关键词表同样写得宽松。`confidence` 不参与判定（设计文档 §8.1）。
 */
export const zoo: Scene = {
  id: 'zoo',
  title: '小熊逛动物园',
  subtitle: '在动物园里认一认这些动物，把它们的样子讲给小熊听',
  backdrop: 'zoo',
  weather: 'sun',
  sticker: 'zoo',
  openingLine: "We are at the zoo! Look at all the animals. Can you tell me what you see?",
  closingLine: "What a day at the zoo! Thank you for telling me about every animal. You are a wonderful talker!",

  beats: [
    /* ── b1 看见了什么 ───────────────────────────────────── */
    {
      id: 'b1_what_animal',
      mood: 'happy',
      characterAnimation: 'wave',
      promptLine: 'Wow! Look over there. What animal can you see?',
      teacherModel: 'You can say: I can see an elephant.',
      requireSelection: 1,
      skill: 'describe',
      objects: [
        { id: 'elephant', art: 'elephant', x: 40, y: 71, correct: true, scale: 1.35 },
        // 猴子是四足爬行姿态，图形扁，按常规倍数放会比别的动物小一圈
        { id: 'monkey', art: 'monkey', x: 58, y: 77, correct: true, scale: 1.25 },
        { id: 'penguin', art: 'penguin', x: 74, y: 70, correct: true },
        { id: 'ball', art: 'ball', x: 89, y: 77, correct: false },
      ],
      targetIntents: [
        {
          id: 'animal_word',
          level: 'basic',
          keywords: [
            ['elephant'],
            ['monkey'],
            ['penguin'],
            ['animal'],
            ['bird'],
            ['big'],
          ],
          model: 'An elephant.',
        },
        {
          id: 'animal_sentence',
          level: 'target',
          keywords: [
            ['see', 'elephant|monkey|penguin|animal'],
            ['is|its|there', 'elephant|monkey|penguin'],
            ['look', 'elephant|monkey|penguin'],
          ],
          model: 'I can see an elephant.',
        },
        {
          id: 'animal_two',
          level: 'challenge',
          keywords: [
            ['elephant', 'monkey'],
            ['elephant', 'penguin'],
            ['monkey', 'penguin'],
            ['and', 'elephant|monkey|penguin'],
          ],
          model: 'I can see an elephant and a monkey.',
        },
      ],
      support: {
        level1: { line: 'Look over there. Which animal is it?', highlight: ['elephant', 'monkey', 'penguin'] },
        level2: { line: 'You can start like this.', starter: 'I can see a ...' },
        fallback: { line: 'I can see an elephant. Tap the one you like!', allowTapToContinue: true },
      },
      successLine: 'You found it! Hello, elephant!',
      successAnimation: 'cheer',
    },

    /* ── b2 它长什么样 ───────────────────────────────────── */
    {
      id: 'b2_describe_it',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'Look at the giraffe. What does she look like?',
      teacherModel: 'You can say: She is very tall.',
      skill: 'describe',
      objects: [
        { id: 'giraffe', art: 'giraffe', x: 43, y: 69, scale: 1.45 },
        { id: 'penguin', art: 'penguin', x: 64, y: 76, scale: 0.85 },
        { id: 'zebra', art: 'zebra', x: 82, y: 70, scale: 1.2 },
      ],
      targetIntents: [
        {
          id: 'look_word',
          level: 'basic',
          keywords: [['tall'], ['long'], ['big'], ['yellow'], ['neck'], ['spots'], ['high']],
          model: 'Tall.',
        },
        {
          id: 'look_phrase',
          level: 'target',
          keywords: [
            ['is|its|shes|she is', 'tall|long|big|yellow'],
            ['long', 'neck'],
            ['has', 'neck|spots|legs'],
          ],
          model: 'She is very tall.',
        },
        {
          id: 'look_two_things',
          level: 'challenge',
          keywords: [
            ['tall', 'neck|long|spots|yellow'],
            ['long', 'neck', 'tall|yellow|spots'],
            ['and', 'tall|long|yellow|spots'],
          ],
          model: 'She is very tall and she has a long neck.',
        },
      ],
      followUp: {
        line: 'And the zebra? Tell me about her too.',
        mood: 'waiting',
        skill: 'describe',
        successLine: 'You described them both!',
        targetIntents: [
          {
            id: 'zebra_look',
            level: 'target',
            keywords: [['stripes'], ['lines'], ['black'], ['white'], ['is|its', 'black|white']],
            model: 'She is black and white.',
          },
        ],
        support: {
          level1: { line: 'Look at her coat. What colours do you see?', highlight: ['zebra'] },
          level2: { line: 'Start like this.', starter: 'She is ...' },
          fallback: { line: 'She is black and white!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Is she short or tall? Look at her neck.', highlight: ['giraffe'] },
        level2: { line: 'Start like this.', starter: 'She is ...' },
        fallback: { line: 'She is very tall and she has a long neck!', allowTapToContinue: true },
      },
      successLine: 'That is right! She can reach the highest leaves.',
      successAnimation: 'bounce',
    },

    /* ── b3 蛇躲在哪里：介词 ──────────────────────────────── */
    {
      id: 'b3_where_is_it',
      mood: 'surprised',
      characterAnimation: 'shrug',
      promptLine: 'Careful! Where is the snake? I cannot find it.',
      requireSelection: 1,
      skill: 'position',
      objects: [
        { id: 'tree', art: 'tree', x: 42, y: 68, correct: true, scale: 1.35 },
        // 台词是「我找不到蛇」，所以它必须先藏着——否则蛇就明摆在画面上，
        // 而小熊还在说找不到。要点选的是**树**（说出「在树下」），蛇不带
        // correct、只靠 reveal 出场；和找球场景里 chair/ball 的分工一样。
        { id: 'snake', art: 'snake', x: 42, y: 78, hidden: true },
        { id: 'lion', art: 'lion', x: 66, y: 71, scale: 1.1 },
        { id: 'box', art: 'box', x: 86, y: 73 },
      ],
      targetIntents: [
        {
          id: 'snake_word',
          level: 'basic',
          keywords: [['tree'], ['under'], ['behind'], ['there'], ['down'], ['snake']],
          model: 'Under the tree.',
        },
        {
          id: 'snake_phrase',
          level: 'target',
          keywords: [
            ['under', 'tree'],
            ['behind', 'tree'],
            ['next to', 'tree'],
            ['by', 'tree'],
          ],
          model: 'It is under the tree.',
        },
        {
          id: 'snake_full',
          level: 'challenge',
          keywords: [
            ['snake', 'is', 'under|behind|next', 'tree'],
            ['think', 'under|behind', 'tree'],
          ],
          model: 'I think the snake is under the tree.',
        },
      ],
      support: {
        level1: { line: 'Look near the tree. Is it up high or down low?', highlight: ['tree', 'snake'] },
        level2: { line: 'Start like this.', starter: 'It is under the ...', pictureCards: ['snake', 'tree'] },
        fallback: { line: 'It is under the tree. Tap it!', allowTapToContinue: true },
      },
      successLine: 'There you are, snake! Hiding in the shade.',
      successAnimation: 'bounce',
      effects: [{ kind: 'reveal', objectId: 'snake' }],
    },

    /* ── b4 喂它吃什么：请求 + 原因 ───────────────────────── */
    {
      id: 'b4_feed_it',
      mood: 'waiting',
      characterAnimation: 'idle',
      promptLine: 'The monkey looks hungry. What should we give her?',
      teacherModel: 'You can say: Give her the banana.',
      requireSelection: 1,
      skill: 'request',
      objects: [
        { id: 'banana', art: 'banana', x: 41, y: 70, correct: true },
        { id: 'leaf', art: 'leaf', x: 56, y: 77, correct: true },
        { id: 'cookie', art: 'cookie', x: 71, y: 70, correct: false },
        { id: 'monkey', art: 'monkey', x: 88, y: 72, scale: 1.35 },
      ],
      targetIntents: [
        {
          id: 'feed_word',
          level: 'basic',
          keywords: [['banana'], ['leaf'], ['leaves'], ['give'], ['food']],
          model: 'A banana.',
        },
        {
          id: 'feed_sentence',
          level: 'target',
          keywords: [
            ['give', 'banana|leaf|leaves'],
            ['want', 'banana|leaf|leaves'],
            ['take', 'banana|leaf|leaves'],
            ['feed', 'banana|leaf|leaves|monkey'],
          ],
          model: 'Give her the banana.',
        },
        {
          id: 'feed_reason',
          level: 'challenge',
          keywords: [
            ['because', 'monkey|like|likes|love|eat|hungry|healthy'],
            ['so', 'hungry|eat|full'],
          ],
          model: 'Give her the banana because monkeys love bananas.',
        },
      ],
      followUp: {
        line: 'Why that one? The cookie looks nice too.',
        mood: 'thinking',
        skill: 'reason',
        successLine: 'You are right. Cookies are for bears, not monkeys!',
        targetIntents: [
          {
            id: 'why_feed',
            level: 'target',
            keywords: [['because'], ['likes'], ['like'], ['love'], ['monkeys'], ['healthy'], ['not'], ['bad']],
            model: 'Because monkeys love bananas.',
          },
        ],
        support: {
          level1: { line: 'What do monkeys eat in the jungle?' },
          level2: { line: 'Start with this word.', starter: 'Because monkeys ...' },
          fallback: { line: 'Because monkeys love bananas!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Which food is right for a monkey?', highlight: ['banana', 'leaf'] },
        level2: { line: 'Start like this.', starter: 'Give her the ...' },
        fallback: { line: 'Give her the banana. Tap it!', allowTapToContinue: true },
      },
      successLine: 'Munch munch! She loves it.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'banana' }],
    },

    /* ── b5 复述：今天看了哪些动物 ────────────────────────── */
    {
      id: 'b5_retell',
      mood: 'happy',
      characterAnimation: 'wave',
      promptLine: 'The zoo is closing. Can you tell me all the animals we saw today?',
      skill: 'retell',
      objects: [
        { id: 'elephant', art: 'elephant', x: 38, y: 70, scale: 1.2 },
        { id: 'giraffe', art: 'giraffe', x: 54, y: 77, scale: 1.2 },
        { id: 'monkey', art: 'monkey', x: 70, y: 70, scale: 1.25 },
        { id: 'zebra', art: 'zebra', x: 86, y: 77, scale: 1.1 },
      ],
      targetIntents: [
        {
          id: 'retell_one_animal',
          level: 'basic',
          keywords: [['elephant'], ['giraffe'], ['monkey'], ['zebra'], ['snake'], ['penguin']],
          model: 'The elephant.',
        },
        {
          id: 'retell_two_animals',
          level: 'target',
          keywords: [
            ['elephant', 'giraffe'],
            ['elephant', 'monkey'],
            ['giraffe', 'monkey'],
            ['monkey', 'zebra'],
            ['and'],
          ],
          model: 'We saw an elephant and a giraffe.',
        },
        {
          id: 'retell_three_animals',
          level: 'challenge',
          keywords: [
            ['elephant', 'giraffe', 'monkey|zebra|snake'],
            ['giraffe', 'monkey', 'zebra|snake'],
          ],
          model: 'We saw an elephant, a giraffe, a monkey and a zebra.',
        },
      ],
      support: {
        level1: { line: 'Think back. Which animals did we meet?', highlight: ['elephant', 'giraffe', 'monkey', 'zebra'] },
        level2: {
          line: 'Start like this.',
          starter: 'We saw ...',
          pictureCards: ['elephant', 'giraffe', 'monkey', 'zebra'],
        },
        fallback: { line: 'We saw an elephant, a giraffe, a monkey and a zebra!', allowTapToContinue: true },
      },
      successLine: 'You remembered every single animal!',
      successAnimation: 'cheer',
    },
  ],
}
