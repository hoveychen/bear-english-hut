/**
 * 生成台词总览。
 *
 *   node scripts/extract-lines.ts   →  public/audio/LINES.md
 *
 * 这份文档有两个用途：
 *
 *   1. **审全部英文内容**。三个场景的台词散在 src/content/*.ts 的结构里，
 *      要判断"这套语言对五岁孩子合不合适"，需要把它们按故事顺序摊平了读。
 *   2. **看每句被指定了什么语气**。语气不是注释——它会进 TTS 的系统提示词，
 *      真的决定音频听起来什么样（见 scripts/generate-audio.ts）。
 *
 * 音频不在这里生成，用 `node scripts/generate-audio.ts`。
 * 内容层改了台词就重跑这两个脚本。
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
      // 读这份文档只需要知道"这句到处都用"，不需要逐一核对位置。
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

  out.push('# 小熊英语小屋 · 台词总览')
  out.push('')
  out.push(
    `本文件由 \`scripts/extract-lines.ts\` 从内容层生成，**不要手改**——` +
      `改台词请改 \`src/content/*.ts\` 再重跑脚本。`,
  )
  out.push('')
  out.push(
    `全片共 **${totalOccurrences}** 处发声，按文本去重后是 **${lines.length}** 句独立台词。` +
      `（同一句话在多处复用的只生成一份音频，见下面「共用台词」。）`,
  )
  out.push('')

  out.push('## 这份文档怎么用')
  out.push('')
  out.push('- **审内容**：三个场景的英文台词按故事顺序摊平在这里，便于整体判断语言难度')
  out.push('- **看语气**：「语气」一列会进 TTS 的系统提示词，真的决定音频听起来什么样，不是注释')
  out.push('- **对文件名**：音频文件名由台词文本派生，与 `manifest.json` 的取值一一对应')
  out.push('')
  out.push('**其中最要紧的一条语气**：支架三（`fallback`）是小熊自己把话说完，')
  out.push('语气里不能有一丝「你没说对」——孩子说不出来的那一刻，正是最容易被吓退的一刻。')
  out.push('')

  out.push('## 生成音频')
  out.push('')
  out.push('```bash')
  out.push('node scripts/generate-audio.ts              # 生成还缺的')
  out.push('node scripts/generate-audio.ts --voice coral --force   # 换音色重做')
  out.push('node scripts/verify-audio.ts               # 复核覆盖率与失效条目')
  out.push('```')
  out.push('')
  out.push(
    '`manifest.json` 里没有的句子会自动回落到浏览器 TTS，' +
      '所以**可以分批生成**——先做一个场景也能立刻听到效果。',
  )
  out.push('')

  if (shared.length > 0) {
    out.push('## 共用台词（跨场景复用，各生成一份）')
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

fs.writeFileSync(path.join(outDir, 'LINES.md'), build())

const occurrences = lines.reduce((n, l) => n + l.occurrences.length, 0)
console.log(`✓ ${lines.length} 句独立台词（${occurrences} 处发声，去重省下 ${occurrences - lines.length} 份音频）`)
console.log(`  public/audio/LINES.md`)
