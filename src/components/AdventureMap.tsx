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

          {/* 地貌：小溪、树林、山丘 */}
          <path d="M60 430 Q240 396 300 440 Q380 496 600 456 Q800 420 950 452" fill="none" stroke="#7fb8d0" strokeWidth="13" strokeLinecap="round" />
          <g fill="#6fae6a" stroke="#2e2a26" strokeWidth="4">
            <path d="M120 210 l34 -60 l34 60 Z" />
            <path d="M172 232 l30 -52 l30 52 Z" />
            <path d="M760 196 l36 -62 l36 62 Z" />
          </g>
          <path d="M420 150 q60 -52 128 -10 q52 32 8 66 q-78 24 -136 -12 Z" fill="#cfe0e7" stroke="#2e2a26" strokeWidth="4" />

          {/* 蜿蜒的路：三个站点串在一起 */}
          <path
            d="M200 330 Q330 300 380 236 Q440 160 510 176 Q600 196 660 268 Q720 336 800 336"
            fill="none"
            stroke="#c9a878"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="3 26"
          />
        </g>

        {/* 空位：虚线画的手撕纸片轮廓 */}
        {(Object.keys(STOPS) as StickerId[]).map((id) => {
          const s = STOPS[id]
          if (earned.includes(id) && id !== justEarned) return null
          return (
            <g key={id} transform={`translate(${s.x * 10 - 62} ${s.y * 5.2 - 62}) rotate(${s.tilt} 62 62)`}>
              <path
                d="M12 26 L30 10 L58 16 L84 8 L104 24 L112 52 L104 82 L86 106 L56 112 L28 104 L10 82 L6 52 Z"
                fill="rgba(46,42,38,0.05)"
                stroke="#8d8274"
                strokeWidth="3"
                strokeDasharray="9 8"
                strokeLinejoin="round"
              />
            </g>
          )
        })}
      </svg>

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
