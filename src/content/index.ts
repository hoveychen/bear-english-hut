import type { Scene } from './types'
import { picnic } from './picnic'
import { clothes } from './clothes'
import { ball } from './ball'
import { breakfast } from './breakfast'

/**
 * 故事顺序即难度顺序：
 *   野餐（请求/原因）→ 穿衣（描述/协商）→ 找球（介词/复述）
 *   → 早餐（请求/顺序）→ 收玩具（介词/描述）→ 洗澡（预测/原因）
 *
 * 后三个复用前三个已经画好的房间（厨房此前一直闲置），所以新增故事
 * 不欠新背景；孩子在同一个家里做不同的事，本来也更接近真实生活。
 */
export const scenes: Scene[] = [picnic, clothes, ball, breakfast]

export function getScene(id: string): Scene | undefined {
  return scenes.find((s) => s.id === id)
}

export * from './types'
