/**
 * 录音覆盖率校验。
 *
 *   node scripts/verify-audio.ts            # 报告
 *   node scripts/verify-audio.ts --strict   # 有任何问题就退出码 1（给 CI 用）
 *
 * 查四件事：
 *   1. 还没录的句子            —— 会回落 TTS，可接受，但你得知道还差多少
 *   2. manifest 指向的文件不存在 —— 播放时 404，然后静默回落 TTS
 *   3. manifest 里的台词内容层已经没有了 —— **最危险的一种**
 *   4. 录了但没写进 manifest    —— 白录了，代码根本不会去找它
 *
 * 第 3 种值得单独说：改一句台词，旧录音不会报错、不会消失，它只是再也不会被
 * 播到，而那一句会悄悄变回机器音。没有这个检查，你只能靠耳朵发现。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectLines } from './audio-lines.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const audioDir = path.join(root, 'public', 'audio')
const manifestPath = path.join(audioDir, 'manifest.json')

const strict = process.argv.includes('--strict')

const lines = collectLines()
const wanted = new Map(lines.map((l) => [l.text, l]))

let manifest: Record<string, string> = {}
let hasManifest = false
if (fs.existsSync(manifestPath)) {
  hasManifest = true
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (e) {
    console.error(`✗ manifest.json 解析失败：${(e as Error).message}`)
    process.exit(1)
  }
}

/** 音频目录里实际存在的文件（排除 manifest 和录音脚本本身）。 */
const onDisk = new Set(
  fs.existsSync(audioDir)
    ? fs.readdirSync(audioDir).filter((f) => /\.(mp3|m4a|wav|ogg|aac)$/i.test(f))
    : [],
)

const missing: string[] = [] // 内容层有，manifest 里没有
const brokenPath: Array<[string, string]> = [] // manifest 有，文件不在
const stale: Array<[string, string]> = [] // manifest 有，内容层已无此台词
const orphanFiles: string[] = [] // 文件在，manifest 没引用

for (const [text] of wanted) {
  if (!manifest[text]) missing.push(text)
}

const referenced = new Set<string>()
for (const [text, file] of Object.entries(manifest)) {
  referenced.add(file)
  if (!wanted.has(text)) stale.push([text, file])
  else if (!onDisk.has(file)) brokenPath.push([text, file])
}

for (const file of onDisk) {
  if (!referenced.has(file)) orphanFiles.push(file)
}

/* ── 报告 ────────────────────────────────────────────── */

const recorded = wanted.size - missing.length
const pct = wanted.size === 0 ? 0 : Math.round((recorded / wanted.size) * 100)

console.log(`\n录音覆盖率：${recorded}/${wanted.size} 句（${pct}%）`)

if (!hasManifest) {
  console.log('\n还没有 public/audio/manifest.json —— 全部台词走浏览器 TTS。')
  console.log('先跑 `node scripts/extract-lines.ts` 生成录音脚本和 manifest 模板。')
}

const section = (title: string, items: string[], note: string) => {
  if (!items.length) return
  console.log(`\n${title}（${items.length}）`)
  console.log(`  ${note}`)
  for (const item of items.slice(0, 12)) console.log(`  · ${item}`)
  if (items.length > 12) console.log(`  … 还有 ${items.length - 12} 条`)
}

section(
  '✗ manifest 指向的文件不存在',
  brokenPath.map(([text, file]) => `${file}  ←  "${text}"`),
  '播放时会 404 然后静默回落 TTS。检查文件名拼写。',
)

section(
  '✗ manifest 里的台词内容层已经没有了',
  stale.map(([text, file]) => `${file}  ←  "${text}"`),
  '台词改过了，这些录音再也播不到。改回台词，或重录并更新 manifest。',
)

section(
  '· 录了但 manifest 没引用',
  orphanFiles,
  '代码不会去找这些文件。是不是漏写进 manifest 了？',
)

section(
  '· 还没录',
  missing,
  '这些会用浏览器 TTS。可以分批录，不影响功能。',
)

if (!brokenPath.length && !stale.length && !orphanFiles.length && !missing.length && hasManifest) {
  console.log('\n✓ 全部台词都有对应录音，manifest 与内容层一致。')
}

// 只有"真错"才让 CI 红：还没录不算错，是进度
const errors = brokenPath.length + stale.length + orphanFiles.length
if (strict && errors > 0) {
  console.error(`\n--strict：${errors} 处需要修。`)
  process.exit(1)
}
console.log('')
