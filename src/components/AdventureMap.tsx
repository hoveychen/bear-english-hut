import { useEffect, useState } from 'react'

import { Sticker, type StickerId } from './HandDrawn'
import { scenes } from '../content'
import './AdventureMap.css'

/**
 * 小熊的冒险地图（设计文档 §7 的记忆点）。
 *
 * 这是整个产品唯一的收集系统，也刻意是唯一的。它不是积分、不是排行榜、
 * 不是连续打卡天数——那些会把"我想再讲一个故事"换成"我不想断"。
 * 地图上只有八个空位和八张贴纸：贴满了，这段旅程就结束了。
 */

/**
 * 八个站点在地图上的落点（百分比），排成上下两行的 S 形。
 *
 * 为什么不再是一行：贴纸直径约占地图宽的 14%，所以站间距不能小于 15%。
 * 一行排八站，x 只能从 10% 铺到 88%，间距 11% —— 必然互相压边。折成两行
 * 之后横向间距 22%、纵向 42%，两边都宽裕。
 *
 * 走向是 S 形（上排从左到右，右端下折，下排从右到左），棋盘游戏的老写法，
 * 孩子跟得住；一行到底再拉一条长回折线反而看不出先后。
 */
const STOPS: Record<StickerId, { x: number; y: number; tilt: number }> = {
  picnic: { x: 16, y: 28, tilt: -7 },
  raincoat: { x: 38, y: 28, tilt: 5 },
  ball: { x: 60, y: 28, tilt: -4 },
  breakfast: { x: 82, y: 28, tilt: 6 },
  toybox: { x: 82, y: 70, tilt: -5 },
  puppy: { x: 60, y: 70, tilt: 8 },
  shopping: { x: 38, y: 70, tilt: 4 },
  zoo: { x: 16, y: 70, tilt: -6 },
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
           * 地貌全部让开八个站点。站点圆心（svg 坐标，x=百分比*10、y=百分比*5.2）：
           *   上排 160,146 · 380,146 · 600,146 · 820,146
           *   下排 820,364 · 600,364 · 380,364 · 160,364
           * 贴纸直径约占地图宽的 14%，在 1000 宽的 viewBox 上就是半径 73，
           * 所以上排吃掉 y 73~219、下排吃掉 y 291~437。剩给地貌的只有三条横带：
           *   顶带 y<73、中带 y 219~291、底带 y>437（纸面只到 504）
           * 外加站点之间那几道 70 宽的竖缝（x 235~305、455~525、675~745）——
           * 竖缝刚好放得下一棵 40 宽的树。
           */}

          {/* 顶带：远山一脊。这条带只有 57 高，放不下整棵树，所以给山 */}
          <g fill="#a8bda2" stroke="#2e2a26" strokeWidth="4" strokeLinejoin="round">
            <path d="M250 70 l46 -44 l46 44 Z" />
            <path d="M316 70 l40 -36 l40 36 Z" />
            <path d="M600 70 l44 -42 l44 42 Z" />
          </g>
          <path d="M278 40 l18 -14 l18 14 q-18 8 -36 0 Z" fill="#fbf7ec" stroke="none" />

          {/* 顶带左端：湖。压得很扁才塞得进这条带 */}
          <path d="M40 42 q54 -24 112 -6 q44 16 8 34 q-66 18 -120 -4 Z" fill="#cfe0e7" stroke="#2e2a26" strokeWidth="4" />
          <g stroke="#7fb8d0" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M66 52 q14 -6 26 0 M104 56 q14 -6 26 0" />
          </g>

          {/* 中带：小溪横穿两排之间 */}
          <path d="M30 258 Q210 240 330 262 Q450 284 600 256 Q760 232 970 260" fill="none" stroke="#7fb8d0" strokeWidth="12" strokeLinecap="round" />

          {/* 树。全部落在竖缝或底带里 */}
          <g stroke="#2e2a26" strokeWidth="3.5" strokeLinejoin="round">
            {[
              // 三道竖缝，每道一棵，纵向错开
              [270, 190], [490, 170], [710, 196],
              [270, 330], [490, 348], [710, 326],
              // 底带：树根 y+26 必须落在纸面（纸底边 504）以内，树顶 y-34 不碰下排最低的 437
              [90, 468], [270, 470], [490, 464], [710, 472], [900, 462],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <path d={`M${x} ${y} l-2 26`} stroke="#8a6236" strokeWidth="6" strokeLinecap="round" />
                <path d={`M${x} ${y - 34} l-20 36 l40 0 Z`} fill="#6fae6a" />
              </g>
            ))}
          </g>

          {/* 蜿蜒的路：上排从左到右，右端下折，下排从右到左 */}
          <path
            d="M160 146 Q270 128 380 146 Q490 164 600 146 Q710 128 820 146 Q918 255 820 364 Q710 382 600 364 Q490 346 380 364 Q270 382 160 364"
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
