import type { Scene } from './types.ts'
import { picnic } from './picnic.ts'
import { clothes } from './clothes.ts'
import { ball } from './ball.ts'
import { breakfast } from './breakfast.ts'
import { toybox } from './toybox.ts'
import { puppy } from './puppy.ts'
import { shopping } from './shopping.ts'

/**
 * 故事顺序即难度顺序：
 *   野餐（请求/原因）→ 穿衣（描述/协商）→ 找球（介词/复述）
 *   → 早餐（请求/顺序）→ 收玩具（介词/描述）→ 洗澡（预测/原因）
 *
 * 后三个复用前三个已经画好的房间（厨房此前一直闲置），所以新增故事
 * 不欠新背景；孩子在同一个家里做不同的事，本来也更接近真实生活。
 *
 * 导入刻意带上 .ts 扩展名（tsconfig 开了 allowImportingTsExtensions）：
 * scripts/ 下的音频工具要用 node 直接 import 这份清单，而 Node 的 ESM 解析
 * 不认无扩展名导入。带上扩展名，场景清单才能只有这一份——先前 scripts/
 * 自己另抄了一份，加了新场景忘了同步，audio:verify 照样报 100%。
 */
export const scenes: Scene[] = [picnic, clothes, ball, breakfast, toybox, puppy, shopping]

export function getScene(id: string): Scene | undefined {
  return scenes.find((s) => s.id === id)
}

export * from './types.ts'
