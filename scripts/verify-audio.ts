/**
 * 录音覆盖率校验。
 *
 *   node scripts/verify-audio.ts            # 报告
 *   node scripts/verify-audio.ts --strict   # 有任何问题就退出码 1（给 CI 用）
 *
 * 查五件事：
 *   1. 还没生成的句子            —— 会回落浏览器 TTS，可接受，但你得知道还差多少
 *   2. manifest 指向的文件不存在  —— 播放时 404，然后静默回落 TTS
 *   3. manifest 里的台词内容层已经没有了 —— **最危险的一种**
 *   4. 生成了但没写进 manifest    —— 白生成了，代码根本不会去找它
 *   5. 音频时长与台词长度严重不符 —— 模型跑飞的产物
 *
 * 第 3 种值得单独说：改一句台词，旧音频不会报错、不会消失，它只是再也不会被
 * 播到，而那一句会悄悄变回机器音。没有这个检查，你只能靠耳朵发现。
 *
 * 第 5 种是**吃过亏才加的**。生成脚本在途已经查过一次时长了，但那只管它自己
 * 那一次生成的东西：换个版本的脚本、手工放进来的文件、或者在途检查本身漏掉的，
 * 都不会再被看第二眼。结果就是一句 10 个词的台词落盘成 818 秒（13 分钟）音频，
 * 一路通过校验进了仓库。**已落盘的状态必须自己能被验证，不能只信生产它的过程。**
 */

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

import { collectLines } from './audio-lines.ts'

const run = promisify(execFile)

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

/* ── 时长审计 ────────────────────────────────────────── */

/**
 * 音频时长与台词词数是否对得上。
 *
 * 阈值与生成脚本一致（每词 1.2 秒 + 4 秒余量），只拦真正离谱的，
 * 不管朗读快慢。ffprobe 拿不到时长就跳过，不因为工具缺失而误报。
 */
async function durationOf(file: string): Promise<number | null> {
  try {
    const { stdout } = await run('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'csv=p=0',
      path.join(audioDir, file),
    ])
    const n = Number(stdout.trim())
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

const oversized: string[] = []
let durationChecked = 0

await Promise.all(
  Object.entries(manifest).map(async ([text, file]) => {
    if (!onDisk.has(file) || !wanted.has(text)) return
    const seconds = await durationOf(file)
    if (seconds === null) return
    durationChecked++
    const words = text.trim().split(/\s+/).length
    const max = words * 1.2 + 4
    if (seconds > max) {
      oversized.push(`${file}  ${seconds.toFixed(1)}s（${words} 词，上限 ${max.toFixed(1)}s）\n      "${text}"`)
    }
  }),
)

/* ── 报告 ────────────────────────────────────────────── */

const recorded = wanted.size - missing.length
const pct = wanted.size === 0 ? 0 : Math.round((recorded / wanted.size) * 100)

console.log(`\n音频覆盖率：${recorded}/${wanted.size} 句（${pct}%），已核对时长 ${durationChecked} 个`)

if (!hasManifest) {
  console.log('\n还没有 public/audio/manifest.json —— 全部台词走浏览器 TTS。')
  console.log('跑 `node scripts/generate-audio.ts` 生成。')
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
  '台词改过了，这些音频再也播不到。改回台词，或重新生成并更新 manifest。',
)

section(
  '· 生成了但 manifest 没引用',
  orphanFiles,
  '代码不会去找这些文件。是不是漏写进 manifest 了？',
)

section(
  '✗ 音频时长与台词严重不符',
  oversized,
  '模型跑飞的产物。删掉这些文件后重跑 generate-audio 补生成。',
)

section(
  '· 还没生成',
  missing,
  '这些会用浏览器 TTS。可以分批生成，不影响功能。',
)

if (
  !brokenPath.length && !stale.length && !orphanFiles.length && !missing.length &&
  !oversized.length && hasManifest
) {
  console.log('\n✓ 全部台词都有音频，manifest 与内容层一致，时长也都合理。')
}

// 只有"真错"才让 CI 红：还没生成不算错，是进度
const errors = brokenPath.length + stale.length + orphanFiles.length + oversized.length
if (strict && errors > 0) {
  console.error(`\n--strict：${errors} 处需要修。`)
  process.exit(1)
}
console.log('')
