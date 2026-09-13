/**
 * 把内容层的 `art` 字段解析成实际可渲染的东西。
 *
 * 两种取值：
 *   'apple'          → src/assets/objects/apple.svg（OpenMoji 素材）
 *   'drawn:blanket'  → 手绘组件（没有对应 emoji 的道具）
 *
 * 内容层因此不需要知道素材从哪来。将来把某个 OpenMoji 换成手绘（或反过来），
 * 只改内容里的一个字符串。
 */

const files = import.meta.glob('../assets/objects/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<
  string,
  string
>

const byName: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()?.replace('.svg', '')
  if (name) byName[name] = url
}

export type ResolvedArt = { kind: 'image'; url: string } | { kind: 'drawn'; name: string } | { kind: 'missing' }

export function resolveArt(art: string): ResolvedArt {
  if (art.startsWith('drawn:')) return { kind: 'drawn', name: art.slice(6) }
  const url = byName[art]
  return url ? { kind: 'image', url } : { kind: 'missing' }
}

/** 给小熊穿戴/手持用：直接要 URL，拿不到就返回 null（不渲染，而不是渲染个破图）。 */
export function artUrl(art: string): string | null {
  return byName[art] ?? null
}
