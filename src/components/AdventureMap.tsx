import { useEffect, useState } from 'react'

import { Sticker, type StickerId } from './HandDrawn'
import { scenes } from '../content'
import './AdventureMap.css'

/**
 * 小熊的冒险地图（设计文档 §7 的记忆点）。
 *
 * 这是整个产品唯一的收集系统，也刻意是唯一的。它不是积分、不是排行榜、
 * 不是连续打卡天数——那些会把"我想再讲一个故事"换成"我不想断"。
 * 地图上只有三个空位和三张贴纸：贴满了，这段旅程就结束了。
 */

/** 三个站点在地图上的落点（百分比）。手工摆的，不等距——地图本来就不规整。 */
const STOPS: Record<StickerId, { x: number; y: number; tilt: number }> = {
  picnic: { x: 20, y: 62, tilt: -7 },
  raincoat: { x: 51, y: 33, tilt: 5 },
  ball: { x: 80, y: 64, tilt: -4 },
}

type Props = {
  earned: StickerId[]
  /** 刚拿到的那一张：会从天而降贴上去 */
  justEarned?: StickerId | null
  onCeremonyDone?: () => void
}

export function AdventureMap({ earned, justEarned = null, onCeremonyDone }: Props) {
  const [landed, setLanded] = useState(false)

  useEffect(() => {
    if (!justEarned) return
    setLanded(false)
    const t1 = window.setTimeout(() => setLanded(true), 1150)
    const t2 = window.setTimeout(() => onCeremonyDone?.(), 2900)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [justEarned, onCeremonyDone])

  return (
    <div className={`map ${justEarned ? 'is-ceremony' : ''}`}>
      <svg className="map__paper" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <filter id="map-crayon" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <g filter="url(#map-crayon)">
          {/* 地图纸 */}
          <path d="M18 26 L980 16 L988 496 L14 504 Z" fill="#f7f0dc" stroke="#2e2a26" strokeWidth="6" strokeLinejoin="round" />

          {/*
           * 地貌全部让开三个站点（200,322 / 510,172 / 800,333）。
           * 第一版把湖画在正中间，结果第二张贴纸的虚线框正好压在湖上，
           * 空位看不出来是空位。
           */}

          {/* 左上：湖 */}
          <path d="M96 92 q66 -44 138 -12 q56 28 12 66 q-82 30 -148 -6 Z" fill="#cfe0e7" stroke="#2e2a26" strokeWidth="4" />
          <g stroke="#7fb8d0" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M128 118 q16 -8 30 0 M170 128 q16 -8 30 0" />
          </g>

          {/* 右上：山 */}
          <g fill="#a8bda2" stroke="#2e2a26" strokeWidth="4" strokeLinejoin="round">
            <path d="M700 120 l58 -74 l58 74 Z" />
            <path d="M778 132 l50 -62 l50 62 Z" />
          </g>
          <path d="M736 74 l22 -28 l22 28 q-22 10 -44 0 Z" fill="#fbf7ec" stroke="none" />

          {/* 底部：小溪 */}
          <path d="M50 446 Q230 414 320 452 Q420 494 620 464 Q810 436 956 462" fill="none" stroke="#7fb8d0" strokeWidth="13" strokeLinecap="round" />

          {/* 散落的树。位置手摆的，避开站点和路径 */}
          <g stroke="#2e2a26" strokeWidth="3.5" strokeLinejoin="round">
            {[
              [96, 260], [140, 318], [88, 382], [352, 96], [300, 150],
              [610, 88], [906, 216], [860, 300], [600, 392], [472, 420], [244, 224],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <path d={`M${x} ${y} l-2 26`} stroke="#8a6236" strokeWidth="6" strokeLinecap="round" />
                <path d={`M${x} ${y - 34} l-20 36 l40 0 Z`} fill="#6fae6a" />
              </g>
            ))}
          </g>

          {/* 蜿蜒的路：正好串起三个站点 */}
          <path
            d="M200 322 Q296 300 356 250 Q436 184 510 172 Q604 192 664 260 Q722 326 800 333"
            fill="none"
            stroke="#c9a878"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="3 26"
          />
        </g>

      </svg>

      {/*
       * 空位和贴纸必须用**同一套定位和尺寸**。
       * 第一版把空位画进 SVG、贴纸用 HTML 定位，于是空位会随地图缩放而贴纸不会——
       * 在 1440 宽下空位比贴纸小了一圈，看着不像"这里缺一张"。
       */}
      {(Object.keys(STOPS) as StickerId[]).map((id) => {
        const s = STOPS[id]
        // 刚拿到的那张仍要留着空位——贴纸得有个地方落下去。落地后才撤掉。
        if (earned.includes(id) && !(id === justEarned && !landed)) return null
        return (
          <div
            key={id}
            className="map__slot"
            style={{ left: `${s.x}%`, top: `${s.y}%`, ['--tilt' as string]: `${s.tilt}deg` }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 120 120" width="128" height="128">
              <path
                d="M12 26 L30 10 L58 16 L84 8 L104 24 L112 52 L104 82 L86 106 L56 112 L28 104 L10 82 L6 52 Z"
                fill="rgba(46,42,38,0.05)"
                stroke="var(--ink-faint)"
                strokeWidth="3"
                strokeDasharray="9 8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )
      })}

      {/* 已获得的贴纸 */}
      {earned.map((id) => {
        const s = STOPS[id]
        if (!s) return null
        const isNew = id === justEarned
        if (isNew && !landed) return null
        return (
          <div
            key={id}
            className={`map__sticker ${isNew ? 'is-new' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, ['--tilt' as string]: `${s.tilt}deg` }}
            title={scenes.find((sc) => sc.sticker === id)?.title}
          >
            <Sticker id={id} size={128} />
          </div>
        )
      })}

      {/* 仪式：贴纸从上方翻着落下来 */}
      {justEarned && !landed && (
        <div className="map__flyIn" style={{ left: `${STOPS[justEarned].x}%`, top: `${STOPS[justEarned].y}%` }}>
          <Sticker id={justEarned} size={150} />
        </div>
      )}
    </div>
  )
}
