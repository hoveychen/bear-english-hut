import type { Scene } from './types'

/**
 * 场景六：给小狗洗澡（起居室）
 *
 * 五个互动任务依次对应 b1..b5：
 *   小狗弄脏了要什么 → 为什么要洗 → 怎么哄他进盆 → 洗完会怎样 → 复述用了什么
 *
 * 这是六个故事里唯一以 predict 收束的：前面几个故事的"预测"都挂在别的技能
 * 后面当追问（野餐 b4、早餐 b4），这里把它放到主线上——小狗接下来会干什么，
 * 是孩子真的有话想说的那种预测，而不是被问出来的。
 *
 * 关键词表同样写得宽松。`confidence` 不参与判定（设计文档 §8.1）。
 */
export const puppy: Scene = {
  id: 'puppy',
  title: '给小狗洗澡',
  subtitle: '小狗在外面玩得一身泥，帮小熊把他洗干净',
  backdrop: 'livingroom',
  sticker: 'puppy',
  openingLine: "Look who is back! My puppy played outside and now he is very dirty. Can you help me?",
  closingLine: "My puppy is clean and happy! Thank you for helping me wash him. You said so much today!",

  beats: [
    /* ── b1 洗澡要用什么：预测 ────────────────────────────── */
    {
      id: 'b1_what_we_need',
      mood: 'surprised',
      characterAnimation: 'shrug',
      promptLine: 'My puppy is covered in mud! What do we need to wash him?',
      teacherModel: 'You can say: We need the bathtub.',
      requireSelection: 1,
      skill: 'predict',
      objects: [
        // 起居室的落地灯占住 29%~37%，而 scale 放大的物件是从中心往两边长的：
        // 澡盆摆在 39% 配 scale 1.3，左缘会长到 29.5%，灯杆就插进盆里了。
        { id: 'bathtub', art: 'bathtub', x: 45, y: 72, correct: true, scale: 1.25 },
        { id: 'soap', art: 'soap', x: 60, y: 70, correct: true },
        { id: 'ball', art: 'ball', x: 73, y: 77, correct: false },
        { id: 'dog', art: 'dog', x: 88, y: 71, scale: 1.25 },
      ],
      targetIntents: [
        {
          id: 'wash_word',
          level: 'basic',
          keywords: [['bathtub'], ['bath'], ['tub'], ['soap'], ['water'], ['wash'], ['shower']],
          model: 'The bathtub.',
        },
        {
          id: 'wash_sentence',
          level: 'target',
          keywords: [
            ['need', 'bathtub|bath|tub|soap|water|shower'],
            ['want', 'bathtub|bath|tub|soap|water'],
            ['use', 'bathtub|bath|tub|soap|water'],
            ['take', 'bathtub|bath|soap|water'],
          ],
          model: 'We need the bathtub.',
        },
        {
          id: 'wash_two_things',
          level: 'challenge',
          keywords: [
            ['bathtub|bath|tub|water', 'soap'],
            ['and', 'bathtub|bath|soap|water'],
          ],
          model: 'We need the bathtub and some soap.',
        },
      ],
      support: {
        level1: { line: 'He is so muddy. What washes the mud away?', highlight: ['bathtub', 'soap'] },
        level2: { line: 'You can start like this.', starter: 'We need the ...' },
        fallback: { line: 'We need the bathtub and some soap. Tap one!', allowTapToContinue: true },
      },
      successLine: 'Good idea! Let us fill the bathtub.',
      successAnimation: 'cheer',
      effects: [{ kind: 'hold', objectId: 'soap' }],
    },

    /* ── b2 为什么要洗：原因 ──────────────────────────────── */
    {
      id: 'b2_why_wash',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'My puppy does not want a bath. Why does he need one?',
      skill: 'reason',
      objects: [
        { id: 'dog', art: 'dog', x: 44, y: 71, scale: 1.2 },
        { id: 'bathtub', art: 'bathtub', x: 66, y: 74, scale: 1.25 },
        { id: 'soap', art: 'soap', x: 84, y: 70 },
      ],
      targetIntents: [
        {
          id: 'why_word',
          level: 'basic',
          keywords: [['dirty'], ['muddy'], ['mud'], ['smelly'], ['because'], ['messy']],
          model: 'Dirty.',
        },
        {
          id: 'why_phrase',
          level: 'target',
          keywords: [
            ['because', 'dirty|muddy|mud|smelly|messy'],
            ['he is|hes', 'dirty|muddy|smelly'],
            ['so', 'dirty|muddy|clean'],
          ],
          model: 'Because he is dirty.',
        },
        {
          id: 'why_full',
          level: 'challenge',
          keywords: [
            ['because', 'dirty|muddy', 'play|outside|mud|garden'],
            ['because', 'played'],
          ],
          model: 'Because he is dirty. He played outside in the mud.',
        },
      ],
      followUp: {
        line: 'And where did he get so dirty?',
        mood: 'waiting',
        skill: 'reason',
        successLine: 'That is right. Outside in the mud!',
        targetIntents: [
          {
            id: 'where_dirty',
            level: 'target',
            keywords: [['outside'], ['mud'], ['garden'], ['park'], ['played'], ['play']],
            model: 'He played outside in the mud.',
          },
        ],
        support: {
          level1: { line: 'He was not inside the house. Where was he?' },
          level2: { line: 'Start with this word.', starter: 'He played ...' },
          fallback: { line: 'He played outside in the mud!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look at his paws. Why does he need a bath?', highlight: ['dog'] },
        level2: { line: 'Start with this word.', starter: 'Because he is ...' },
        fallback: { line: 'Because he is dirty!', allowTapToContinue: true },
      },
      successLine: 'Exactly. In you go, puppy!',
      successAnimation: 'bounce',
    },

    /* ── b3 怎么哄他进盆：请求 ────────────────────────────── */
    {
      id: 'b3_cheer_him_up',
      mood: 'confused',
      characterAnimation: 'shrug',
      promptLine: 'He is still scared of the water. What can we give him to make him happy?',
      teacherModel: 'You can say: Give him the duck.',
      requireSelection: 1,
      skill: 'request',
      objects: [
        { id: 'duck', art: 'duck', x: 40, y: 70, correct: true },
        { id: 'bone', art: 'bone', x: 55, y: 77, correct: true },
        { id: 'sponge', art: 'sponge', x: 70, y: 70, correct: false },
        { id: 'bathtub', art: 'bathtub', x: 87, y: 73, scale: 1.25 },
      ],
      targetIntents: [
        {
          id: 'toy_for_dog_word',
          level: 'basic',
          keywords: [['duck'], ['bone'], ['toy'], ['give']],
          model: 'The duck.',
        },
        {
          id: 'toy_for_dog_sentence',
          level: 'target',
          keywords: [
            ['give', 'duck|bone|toy'],
            ['want', 'duck|bone|toy'],
            ['take', 'duck|bone'],
            ['put', 'duck|bone'],
          ],
          model: 'Give him the duck.',
        },
        {
          id: 'toy_for_dog_reason',
          level: 'challenge',
          keywords: [['because', 'happy|likes|like|play|fun|scared']],
          model: 'Give him the duck because he likes to play.',
        },
      ],
      followUp: {
        line: 'Why will that make him happy?',
        mood: 'thinking',
        skill: 'reason',
        successLine: 'You understand him very well!',
        targetIntents: [
          {
            id: 'why_happy',
            level: 'target',
            keywords: [['because'], ['likes'], ['like'], ['play'], ['fun'], ['happy'], ['loves']],
            model: 'Because he likes to play.',
          },
        ],
        support: {
          level1: { line: 'What do puppies love doing?' },
          level2: { line: 'Start with this word.', starter: 'Because he likes ...' },
          fallback: { line: 'Because he likes to play!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look. Which one is a toy he would love?', highlight: ['duck', 'bone'] },
        level2: { line: 'Start like this.', starter: 'Give him the ...' },
        fallback: { line: 'Give him the duck. Tap it!', allowTapToContinue: true },
      },
      successLine: 'Splash! He jumped right in.',
      successAnimation: 'cheer',
      effects: [{ kind: 'collect', objectId: 'duck' }],
    },

    /* ── b4 洗完会怎样：预测 ──────────────────────────────── */
    {
      id: 'b4_what_next',
      mood: 'waiting',
      characterAnimation: 'idle',
      promptLine: 'He is all clean now, but he is very wet. What do you think he will do next?',
      skill: 'predict',
      objects: [
        { id: 'dog', art: 'dog', x: 45, y: 70, scale: 1.25 },
        { id: 'bathtub', art: 'bathtub', x: 68, y: 75, scale: 1.2 },
        { id: 'duck', art: 'duck', x: 86, y: 70 },
      ],
      targetIntents: [
        {
          id: 'next_word',
          level: 'basic',
          keywords: [['shake'], ['run'], ['jump'], ['wet'], ['dry'], ['out'], ['play']],
          model: 'Shake!',
        },
        {
          id: 'next_sentence',
          level: 'target',
          keywords: [
            ['he will|hell', 'shake|run|jump|dry|play'],
            ['think', 'shake|run|jump|dry'],
            ['going to|gonna', 'shake|run|jump'],
            ['shake', 'water|wet|dry'],
          ],
          model: 'I think he will shake.',
        },
        {
          id: 'next_full',
          level: 'challenge',
          // challenge 必须比 target 真的更难：第一版写成
          // ['think','he will|hell','shake|run|jump']，而那正好就是 target
          // 的说法，于是「I think he will shake.」被判成了 challenge，
          // 家长端会把"能说完整句"错报成"能说出挑战级表达"。挑战档要带上原因。
          keywords: [
            ['think', 'he will|hell|going to|gonna', 'shake|run|jump', 'because|wet|water'],
            ['shake|run|jump', 'because'],
            ['shake|run|jump', 'wet|water'],
          ],
          model: 'I think he will shake because he is wet.',
        },
      ],
      followUp: {
        line: 'Oh no, he shook water everywhere! Are we wet now too?',
        mood: 'surprised',
        skill: 'describe',
        successLine: 'We are soaking wet. What a funny puppy!',
        targetIntents: [
          {
            id: 'we_are_wet',
            level: 'target',
            keywords: [['yes'], ['wet'], ['water'], ['we are|were'], ['all']],
            model: 'Yes! We are wet too.',
          },
        ],
        support: {
          level1: { line: 'Look at us. Are we dry or wet?' },
          level2: { line: 'Start like this.', starter: 'Yes, we are ...' },
          fallback: { line: 'Yes, we are wet too!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'A wet puppy always does the same thing. What is it?', highlight: ['dog'] },
        level2: { line: 'Start like this.', starter: 'I think he will ...' },
        fallback: { line: 'I think he will shake!', allowTapToContinue: true },
      },
      successLine: 'Watch out! Here it comes!',
      successAnimation: 'bounce',
    },

    /* ── b5 复述：我们用了什么 ────────────────────────────── */
    {
      id: 'b5_retell',
      mood: 'happy',
      characterAnimation: 'wave',
      promptLine: 'My puppy smells lovely now. Can you tell me what we used to wash him?',
      skill: 'retell',
      objects: [
        { id: 'bathtub', art: 'bathtub', x: 43, y: 72, scale: 1.15 },
        { id: 'soap', art: 'soap', x: 56, y: 77 },
        { id: 'sponge', art: 'sponge', x: 71, y: 70 },
        { id: 'duck', art: 'duck', x: 86, y: 77 },
      ],
      targetIntents: [
        {
          id: 'retell_one_thing',
          level: 'basic',
          keywords: [['bathtub'], ['bath'], ['soap'], ['sponge'], ['duck'], ['water']],
          model: 'The soap.',
        },
        {
          id: 'retell_two_things',
          level: 'target',
          keywords: [
            ['soap', 'bathtub|bath|water'],
            ['soap', 'sponge'],
            ['soap', 'duck'],
            ['bathtub|bath', 'duck'],
            ['and'],
          ],
          model: 'We used the bathtub and the soap.',
        },
        {
          id: 'retell_three_things',
          level: 'challenge',
          keywords: [['bathtub|bath|water', 'soap', 'sponge|duck']],
          model: 'We used the bathtub, the soap, a sponge and his duck.',
        },
      ],
      support: {
        level1: { line: 'Look around the tub. What did we use?', highlight: ['bathtub', 'soap', 'sponge', 'duck'] },
        level2: { line: 'Start like this.', starter: 'We used ...', pictureCards: ['bathtub', 'soap', 'sponge', 'duck'] },
        fallback: { line: 'We used the bathtub, the soap, a sponge and his duck!', allowTapToContinue: true },
      },
      successLine: 'You remembered every single thing!',
      successAnimation: 'cheer',
    },
  ],
}
