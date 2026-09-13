import { DrawnProp } from './HandDrawn'
import { resolveArt } from './objectArt'
import './SupportPrompt.css'

/**
 * 第二级支架的图片顺序卡（设计文档 §7）。
 *
 * 这里是整个产品最容易走偏的地方：最省事的做法是把 "First ... then ..."
 * 打在屏幕上。但目标用户可能还不能独立阅读英文句子——打出来的字对她没有帮助，
 * 只会变成给大人看的装饰。所以顺序靠**图片 + 手绘箭头 + 序号点**表达，
 * 句首靠**播出来**，屏幕上一个英文字都没有。
 */

type Props = {
  /** 物品 id 序列。既可以是 OpenMoji 素材名，也可以是 `drawn:` 手绘道具。 */
  cards: string[]
  /** 再听一遍句首示范 */
  onReplayStarter: () => void
}

export function SupportPrompt({ cards, onReplayStarter }: Props) {
  if (cards.length === 0) return null

  return (
    <div className="support" role="group" aria-label="picture-order-cards">
      {cards.map((id, i) => {
        const art = resolveArt(id)
        return (
          <div className="support__slot" key={`${id}-${i}`}>
            <div className="support__card" style={{ ['--tilt' as string]: `${(i % 2 === 0 ? -1 : 1) * (2 + (i % 3))}deg` }}>
              {/* 序号用点，不用数字——5 岁孩子认点比认数字快 */}
              <span className="support__dots" aria-hidden="true">
                {Array.from({ length: i + 1 }, (_, k) => (
                  <i key={k} />
                ))}
              </span>
              {art.kind === 'image' && <img src={art.url} alt="" draggable={false} />}
              {art.kind === 'drawn' && (
                <span className="support__drawn">
                  <DrawnProp name={art.name} size={54} />
                </span>
              )}
              {art.kind === 'missing' && <span className="support__blank" />}
            </div>

            {i < cards.length - 1 && (
              <svg className="support__arrow" viewBox="0 0 46 30" aria-hidden="true">
                <path d="M4 16 Q20 6 38 15" fill="none" stroke="var(--sea)" strokeWidth="4" strokeLinecap="round" />
                <path d="M30 8 L40 15 L29 21" fill="none" stroke="var(--sea)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )
      })}

      {/* 句首支架的复听键：一个说话泡泡，泡泡里是三个点，不是英文 */}
      <button type="button" className="support__replay" onClick={onReplayStarter} aria-label="再听一次句首示范">
        <svg viewBox="0 0 54 46" width="40" height="34" aria-hidden="true">
          <path
            d="M6 8 Q6 3 12 3 L42 3 Q48 3 48 8 L48 28 Q48 33 42 33 L22 33 L12 43 L13 33 Q6 33 6 28 Z"
            fill="var(--paper-lit)"
            stroke="var(--ink)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="18" r="3.4" fill="var(--sea)" />
          <circle cx="27" cy="18" r="3.4" fill="var(--sea)" />
          <circle cx="36" cy="18" r="3.4" fill="var(--sea)" />
        </svg>
      </button>
    </div>
  )
}
