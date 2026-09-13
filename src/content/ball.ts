import type { Scene } from './types'

/**
 * 场景三：球去了哪里（设计文档 §5.3）
 *
 * b1 猜第一个位置 → b2 用介词精确描述 → b3 预测下一处 → b4 找到 → b5 复述两三句
 *
 * 这一场的语言重心是**介词**和**时态对比**（It was ... but now it is ...）。
 * 所以 b1..b3 每一拍都把球藏在一个新的家具后面，介词必须变，孩子不能靠记住
 * 上一句蒙混过关。
 */
export const ball: Scene = {
  id: 'ball',
  title: '球去了哪里',
  subtitle: '跟着线索找到小球，再把找的过程讲给小熊听',
  backdrop: 'livingroom',
  sticker: 'ball',
  openingLine: "Oh no! I was playing with my ball and now it is gone. Where did the ball go?",
  closingLine: "You found it! And you told me the whole story. You are a great helper!",

  beats: [
    /* ── b1 第一次猜 ─────────────────────────────────────── */
    {
      id: 'b1_guess',
      mood: 'confused',
      characterAnimation: 'shrug',
      promptLine: 'I heard a bump over there. Where do you think the ball is?',
      teacherModel: 'You can say: I think it is under the chair.',
      requireSelection: 1,
      skill: 'position',
      objects: [
        { id: 'chair', art: 'chair', x: 22, y: 62, correct: true },
        { id: 'couch', art: 'couch', x: 48, y: 66, correct: false },
        { id: 'box', art: 'box', x: 72, y: 68, correct: false },
        { id: 'ball', art: 'ball', x: 23, y: 76, hidden: true, scale: 0.8 },
      ],
      targetIntents: [
        {
          id: 'pos_word',
          level: 'basic',
          keywords: [['chair'], ['under'], ['box'], ['sofa'], ['couch'], ['there']],
          model: 'Under the chair.',
        },
        {
          id: 'pos_phrase',
          level: 'target',
          keywords: [
            ['under', 'chair|box|sofa|couch|table'],
            ['behind', 'chair|box|sofa|couch|table'],
            ['in', 'box'],
            ['next to', 'chair|box|sofa|couch'],
          ],
          model: 'Under the chair.',
        },
        {
          id: 'pos_think',
          level: 'challenge',
          keywords: [
            ['think', 'under|behind|in|next', 'chair|box|sofa|couch'],
            ['maybe', 'under|behind|in|next'],
          ],
          model: 'I think it is under the chair.',
        },
      ],
      followUp: {
        line: 'Tell me the whole sentence. I think it is ...',
        mood: 'waiting',
        skill: 'position',
        successLine: 'Let us go and look!',
        targetIntents: [
          {
            id: 'pos_sentence_fu',
            level: 'target',
            keywords: [
              ['think', 'under|behind|in|next to'],
              ['maybe', 'under|behind|in|next to'],
              ['it is|its', 'under|behind|in|next to'],
            ],
            model: 'I think it is under the chair.',
          },
        ],
        support: {
          level1: { line: 'Where is it? Under? Behind? In?', highlight: ['chair'] },
          level2: { line: 'Start like this.', starter: 'I think it is ...' },
          fallback: { line: 'I think it is under the chair!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Listen again. The sound came from over here.', highlight: ['chair'] },
        level2: { line: 'Start like this.', starter: 'I think it is ...' },
        fallback: { line: 'I think it is under the chair. Tap the chair!', allowTapToContinue: true },
      },
      successLine: 'Let us look under the chair!',
      successAnimation: 'lean',
      effects: [{ kind: 'reveal', objectId: 'ball' }],
    },

    /* ── b2 球滚走了，换介词 ─────────────────────────────── */
    {
      id: 'b2_rolled',
      mood: 'surprised',
      characterAnimation: 'bounce',
      promptLine: 'It rolled away! Look, now it is somewhere new. Where is the ball now?',
      skill: 'position',
      objects: [
        { id: 'couch', art: 'couch', x: 30, y: 64, correct: true },
        { id: 'ball', art: 'ball', x: 30, y: 54, scale: 0.75 },
        { id: 'door', art: 'door', x: 62, y: 60, correct: false },
        { id: 'tree', art: 'tree', x: 82, y: 62, correct: false },
      ],
      targetIntents: [
        {
          id: 'behind_word',
          level: 'basic',
          keywords: [['behind'], ['couch'], ['sofa'], ['back']],
          model: 'Behind the sofa.',
        },
        {
          id: 'behind_phrase',
          level: 'target',
          keywords: [
            ['behind', 'couch|sofa'],
            ['on', 'couch|sofa'],
            ['next to', 'couch|sofa'],
          ],
          model: 'It is behind the sofa.',
        },
        {
          id: 'was_but_now',
          level: 'challenge',
          keywords: [
            ['was', 'now'],
            ['but', 'now'],
          ],
          model: 'It was under the chair, but now it is behind the sofa.',
        },
      ],
      followUp: {
        line: 'Where was it before? It was ... but now it is ...',
        mood: 'thinking',
        skill: 'retell',
        successLine: 'You told me before and now. That is a big sentence!',
        targetIntents: [
          {
            id: 'was_now_fu',
            level: 'target',
            keywords: [['was'], ['before'], ['chair'], ['but'], ['now']],
            model: 'It was under the chair, but now it is behind the sofa.',
          },
        ],
        support: {
          level1: { line: 'First the chair. Now the sofa. Can you say both?', highlight: ['couch'] },
          level2: { line: 'Start like this.', starter: 'It was under the chair, but now ...', pictureCards: ['chair', 'couch'] },
          fallback: { line: 'It was under the chair, but now it is behind the sofa.', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look at the sofa. Is the ball in front or behind?', highlight: ['couch'] },
        level2: { line: 'Start like this.', starter: 'It is behind the ...' },
        fallback: { line: 'It is behind the sofa!', allowTapToContinue: true },
      },
      successLine: 'Yes! Behind the sofa.',
      successAnimation: 'cheer',
    },

    /* ── b3 预测下一处 ───────────────────────────────────── */
    {
      id: 'b3_predict',
      mood: 'thinking',
      characterAnimation: 'lean',
      promptLine: 'The dog is running with my ball! Where will it go next?',
      skill: 'predict',
      objects: [
        { id: 'dog', art: 'dog', x: 34, y: 64, scale: 1.2 },
        { id: 'box', art: 'box', x: 58, y: 68, correct: true },
        { id: 'tree', art: 'tree', x: 80, y: 62, correct: true },
      ],
      targetIntents: [
        {
          id: 'predict_word',
          level: 'basic',
          keywords: [['box'], ['tree'], ['outside'], ['garden'], ['in']],
          model: 'In the box.',
        },
        {
          id: 'predict_phrase',
          level: 'target',
          keywords: [
            ['in', 'box'],
            ['under', 'tree'],
            ['behind', 'tree|box'],
            ['next to', 'tree|box'],
          ],
          model: 'In the box.',
        },
        {
          id: 'predict_maybe',
          level: 'challenge',
          keywords: [
            ['maybe', 'in|under|behind|next'],
            ['think', 'in|under|behind|next'],
            ['will', 'in|under|behind|next'],
          ],
          model: 'Maybe it will go in the box.',
        },
      ],
      support: {
        level1: { line: 'Look where the dog is going. Guess!', highlight: ['box', 'tree'] },
        level2: { line: 'Start with this word.', starter: 'Maybe it is ...' },
        fallback: { line: 'Maybe it will go in the box!', allowTapToContinue: true },
      },
      successLine: 'Good guess! Let us follow the dog.',
      successAnimation: 'bounce',
      effects: [{ kind: 'backdrop', to: 'meadow' }],
    },

    /* ── b4 找到了 ───────────────────────────────────────── */
    {
      id: 'b4_found',
      mood: 'happy',
      characterAnimation: 'cheer',
      promptLine: 'There it is! Can you tell me where you found my ball?',
      skill: 'position',
      objects: [
        { id: 'box', art: 'box', x: 40, y: 66, correct: true },
        { id: 'ball', art: 'ball', x: 40, y: 56, scale: 0.8 },
        { id: 'dog', art: 'dog', x: 70, y: 64 },
      ],
      targetIntents: [
        {
          id: 'found_word',
          level: 'basic',
          keywords: [['box'], ['in'], ['there'], ['found']],
          model: 'In the box.',
        },
        {
          id: 'found_phrase',
          level: 'target',
          keywords: [
            ['in', 'box'],
            ['found', 'box'],
            ['it is|its', 'box'],
          ],
          model: 'It is in the box.',
        },
        {
          id: 'found_full',
          level: 'challenge',
          keywords: [['found', 'in', 'box']],
          model: 'I found it in the box.',
        },
      ],
      support: {
        level1: { line: 'Look inside. Where is it?', highlight: ['box'] },
        level2: { line: 'Start like this.', starter: 'I found it in the ...' },
        fallback: { line: 'I found it in the box!', allowTapToContinue: true },
      },
      successLine: 'My ball! Thank you so much!',
      successAnimation: 'cheer',
      effects: [{ kind: 'hold', objectId: 'ball' }],
    },

    /* ── b5 复述整个过程（2–4 句） ───────────────────────── */
    {
      id: 'b5_retell',
      mood: 'waiting',
      characterAnimation: 'idle',
      promptLine: 'Now tell me the whole story. How did we find the ball? First ... then ...',
      teacherModel: 'First it was under the chair. Then it went behind the sofa. Then the dog put it in the box.',
      skill: 'retell',
      objects: [
        { id: 'chair', art: 'chair', x: 20, y: 64 },
        { id: 'couch', art: 'couch', x: 44, y: 66 },
        { id: 'dog', art: 'dog', x: 66, y: 64 },
        { id: 'box', art: 'box', x: 86, y: 66 },
      ],
      targetIntents: [
        {
          id: 'retell_one_place',
          level: 'basic',
          keywords: [['chair'], ['sofa'], ['couch'], ['box'], ['dog']],
          model: 'The chair.',
        },
        {
          id: 'retell_two_places',
          level: 'target',
          keywords: [
            ['first', 'then'],
            ['chair', 'sofa|couch'],
            ['chair', 'box'],
            ['sofa|couch', 'box'],
          ],
          model: 'First it was under the chair, then it went behind the sofa.',
        },
        {
          id: 'retell_three_places',
          level: 'challenge',
          keywords: [
            ['first', 'then', 'chair', 'box'],
            ['chair', 'sofa|couch', 'box'],
          ],
          model: 'First it was under the chair. Then it went behind the sofa. Then the dog put it in the box.',
        },
      ],
      followUp: {
        line: 'And then? What did the dog do?',
        mood: 'waiting',
        skill: 'retell',
        successLine: 'You told the whole story by yourself!',
        targetIntents: [
          {
            id: 'retell_dog',
            level: 'target',
            keywords: [['dog'], ['box'], ['then'], ['took'], ['ran'], ['put']],
            model: 'Then the dog put it in the box.',
          },
        ],
        support: {
          level1: { line: 'What did the dog do with the ball?', highlight: ['dog', 'box'] },
          level2: { line: 'Start like this.', starter: 'Then the dog ...', pictureCards: ['dog', 'box'] },
          fallback: { line: 'Then the dog put it in the box!', allowTapToContinue: true },
        },
      },
      support: {
        level1: { line: 'Look at the pictures. The chair, the sofa, the box.', highlight: ['chair', 'couch', 'box'] },
        level2: {
          line: 'Start like this.',
          starter: 'First it was under the ...',
          pictureCards: ['chair', 'couch', 'dog', 'box'],
        },
        fallback: {
          line: 'First it was under the chair. Then it went behind the sofa. Then the dog put it in the box.',
          allowTapToContinue: true,
        },
      },
      successLine: 'What a story! You said so many sentences.',
      successAnimation: 'cheer',
    },
  ],
}
