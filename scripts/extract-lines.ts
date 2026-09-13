/**
 * 生成录音脚本。
 *
 *   node scripts/extract-lines.ts
 *
 * 产出两个文件：
 *   public/audio/RECORDING-SCRIPT.md   —— 念稿的人照着录
 *   public/audio/manifest.template.json —— 全部录完后可直接改名成 manifest.json
 *
 * 内容层改了台词就重跑一次。改完记得 `node scripts/verify-audio.ts` 看看
 * 哪些旧录音失效了。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectLines, groupLines, ROLE_LABEL, ROLE_TONE, scenes, type AudioLine } from './audio-lines.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'audio')

const EXT = 'mp3'

function table(lines: AudioLine[], showWhere: boolean): string {
  const head = showWhere
    ? '| 文件名 | 台词 | 语气 | 出现在 |\n|---|---|---|---|'
    : '| 文件名 | 台词 | 语气 |\n|---|---|---|'

  const rows = lines.map((l) => {
    // 同一句可能担任多个角色，语气取第一个（也是最主要的那个）
    const role = l.occurrences[0]!.role
    const cells = [`\`${l.slug}.${EXT}\``, `**${l.text}**`, ROLE_TONE[role]]
    if (showWhere) {
      // "Start like this." 出现 18 处，全列出来会把表格撑到没法读。
      // 念稿的人只需要知道"这句到处都用"，不需要逐一核对位置。
      const all = l.occurrences.map(
        (o) => `${o.sceneTitle}·${o.beatId ?? '整场'}${o.depth > 0 ? `·追问${o.depth}` : ''}`,
      )
      const shown = all.slice(0, 3).join('<br>')
      cells.push(all.length > 3 ? `${shown}<br>…共 ${all.length} 处` : shown)
    }
    return `| ${cells.join(' | ')} |`
  })

  return [head, ...rows].join('\n')
}

function build(): string {
  const lines = collectLines()
  const { shared, perScene } = groupLines(lines)
  const totalOccurrences = lines.reduce((n, l) => n + l.occurrences.length, 0)

  const out: string[] = []

  out.push('# 小熊英语小屋 · 录音脚本')
  out.push('')
  out.push(
    `本文件由 \`scripts/extract-lines.ts\` 从内容层生成，**不要手改**——` +
      `改台词请改 \`src/content/*.ts\` 再重跑脚本。`,
  )
  out.push('')
  out.push(
    `全片共 **${totalOccurrences}** 处需要发声，去重后只需录 **${lines.length}** 句。` +
      `（同一句话在多处复用的只录一次，见下面「共用台词」。）`,
  )
  out.push('')

  out.push('## 怎么录')
  out.push('')
  out.push('- **一句一个文件**，文件名照下表，放进 `public/audio/`')
  out.push(`- 格式 \`.${EXT}\`，单声道，44.1kHz 就够；音量统一，句子前后各留约 0.2 秒静音`)
  out.push('- 语速比平常慢一点，但**不要一个词一个词地蹦**——孩子要听到的是自然句子的节奏')
  out.push('- 全程同一个人、同一支麦、同一个房间。换音色比音质差更让孩子出戏')
  out.push('- 念的对象是一个 5 岁孩子，不是摄像机。可以笑，可以停顿')
  out.push('')
  out.push('**最要紧的一条**：这不是在播报正确答案。')
  out.push('支架三（`fallback`）是小熊自己把话说完，语气里不能有一丝「你没说对」——')
  out.push('孩子说不出来的那一刻，正是最容易被吓退的一刻。')
  out.push('')

  out.push('## 录完之后')
  out.push('')
  out.push('```bash')
  out.push('# 1. 音频放进 public/audio/')
  out.push('# 2. 生成 manifest（模板已经按文件名填好）')
  out.push('cp public/audio/manifest.template.json public/audio/manifest.json')
  out.push('# 3. 校验：哪些还没录、哪些录了但内容层已经改了')
  out.push('node scripts/verify-audio.ts')
  out.push('```')
  out.push('')
  out.push(
    '`manifest.json` 里没有的句子会自动回落到浏览器 TTS，' +
      '所以**可以分批录**——先录一个场景也能立刻听到效果。',
  )
  out.push('')

  if (shared.length > 0) {
    out.push('## 共用台词（跨场景复用，各录一次）')
    out.push('')
    out.push(table(shared, true))
    out.push('')
  }

  for (const scene of scenes) {
    const list = perScene.get(scene.id)
    if (!list?.length) continue
    out.push(`## ${scene.title}`)
    out.push('')
    out.push(`> ${scene.subtitle}`)
    out.push('')

    // 按故事顺序分组，让念稿的人能顺着情节走
    const beatOrder = new Map<string, number>(scene.beats.map((b, i) => [b.id, i]))
    const ordered = [...list].sort((a, b) => {
      const oa = a.occurrences[0]!
      const ob = b.occurrences[0]!
      const ia = oa.beatId === null ? (oa.role === 'opening' ? -1 : 999) : (beatOrder.get(oa.beatId) ?? 0)
      const ib = ob.beatId === null ? (ob.role === 'opening' ? -1 : 999) : (beatOrder.get(ob.beatId) ?? 0)
      if (ia !== ib) return ia - ib
      return oa.depth - ob.depth
    })

    let currentBeat: string | null | undefined
    let buffer: AudioLine[] = []
    const flush = () => {
      if (!buffer.length) return
      const label =
        currentBeat === null
          ? '整场'
          : `${currentBeat} — ${scene.beats.find((b) => b.id === currentBeat)?.promptLine ?? ''}`
      out.push(`### ${label}`)
      out.push('')
      out.push(table(buffer, false))
      out.push('')
      buffer = []
    }

    for (const line of ordered) {
      const beatId = line.occurrences[0]!.beatId
      if (beatId !== currentBeat) {
        flush()
        currentBeat = beatId
      }
      buffer.push(line)
    }
    flush()
  }

  out.push('---')
  out.push('')
  out.push('### 角色一览')
  out.push('')
  out.push('| 角色 | 含义 | 语气 |')
  out.push('|---|---|---|')
  for (const [role, label] of Object.entries(ROLE_LABEL)) {
    out.push(`| \`${role}\` | ${label} | ${ROLE_TONE[role as keyof typeof ROLE_TONE]} |`)
  }
  out.push('')

  return out.join('\n')
}

fs.mkdirSync(outDir, { recursive: true })

const lines = collectLines()
const manifest = Object.fromEntries(lines.map((l) => [l.text, `${l.slug}.${EXT}`]))

fs.writeFileSync(path.join(outDir, 'RECORDING-SCRIPT.md'), build())
fs.writeFileSync(path.join(outDir, 'manifest.template.json'), `${JSON.stringify(manifest, null, 2)}\n`)

const occurrences = lines.reduce((n, l) => n + l.occurrences.length, 0)
console.log(`✓ ${lines.length} 句待录（${occurrences} 处发声，去重省下 ${occurrences - lines.length} 句）`)
console.log(`  public/audio/RECORDING-SCRIPT.md`)
console.log(`  public/audio/manifest.template.json`)
