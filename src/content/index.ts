import type { Scene } from './types'
import { picnic } from './picnic'
import { clothes } from './clothes'
import { ball } from './ball'

/** 故事顺序即难度顺序：野餐（请求/原因）→ 穿衣（描述/协商）→ 找球（介词/复述）。 */
export const scenes: Scene[] = [picnic, clothes, ball]

export function getScene(id: string): Scene | undefined {
  return scenes.find((s) => s.id === id)
}

export * from './types'
