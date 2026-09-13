import { Backdrop } from './Backdrop'
import { Bear } from './Bear'
import { DrawnProp } from './HandDrawn'
import { artUrl, resolveArt } from './objectArt'
import type { MachineView } from '../state/useBeatMachine'
import './StoryStage.css'

/**
 * 绘本式故事舞台（设计文档 §7）。
 *
 * 画面上**没有一个英文字**。孩子能读到的全部信息是：小熊的表情和动作、
 * 物品的位置和变化、天气、以及哪些东西在轻轻跳（= 该看这里）。
 */

type Props = {
  view: MachineView
  onSelectObject: (id: string) => void
}

export function StoryStage({ view, onSelectObject }: Props) {
  const { beat, stage, mood, action, selected, highlight, tapToContinue, phase } = view

  const objects = (beat?.objects ?? []).filter((o) => {
    if (stage.removed.includes(o.id)) return false
    // 被小熊穿上 / 拿起 / 收进篮子的东西，从舞台上离场——语言真的改变了场景
    if (stage.collected.includes(o.id) && o.id !== 'basket') return false
    if (stage.wearing === o.id || stage.holding === o.id) return false
    if (o.hidden && !stage.revealed.includes(o.id)) return false
    return true
  })

  const tappable = phase === 'observe' || phase === 'invite' || tapToContinue

  return (
    <div className="stage">
      <Backdrop id={stage.backdrop} weather={stage.weather} />

      <div className="stage__field">
        <div className="stage__bear">
          <Bear
            mood={mood}
            action={action}
            wearing={stage.wearing ? artUrl(stage.wearing) : null}
            holding={stage.holding ? artUrl(stage.holding) : null}
            size={230}
          />
        </div>

        {objects.map((o) => {
          const art = resolveArt(o.art)
          const isSelected = selected.includes(o.id)
          const isHighlighted = highlight.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              className={[
                'stage__object',
                isSelected ? 'is-selected' : '',
                isHighlighted ? 'is-highlighted' : '',
                tappable ? 'is-tappable' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                ['--obj-scale' as string]: String(o.scale ?? 1),
              }}
              disabled={!tappable}
              onClick={() => onSelectObject(o.id)}
              // 孩子端无文字，但屏幕阅读器和自动化测试需要一个把手
              aria-label={o.id}
            >
              <span className="stage__objectArt">
                {art.kind === 'image' && <img src={art.url} alt="" draggable={false} />}
                {art.kind === 'drawn' && <DrawnProp name={art.name} />}
              </span>
            </button>
          )
        })}

        {/* 收进篮子的东西在角落堆成一小摞，让"我攒了这些"看得见 */}
        {stage.collected.length > 0 && (
          <div className="stage__collected" aria-label="basket-contents">
            {stage.collected.map((id, i) => {
              const url = artUrl(id)
              return url ? <img key={id} src={url} alt="" style={{ ['--i' as string]: String(i) }} /> : null
            })}
          </div>
        )}
      </div>
    </div>
  )
}
