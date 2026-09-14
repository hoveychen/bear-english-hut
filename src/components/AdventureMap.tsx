import { useEffect, useState } from 'react'

import { Sticker, type StickerId } from './HandDrawn'
import { scenes } from '../content'
import './AdventureMap.css'

/**
 * 小熊的冒险地图（设计文档 §7 的记忆点）。
 *
 * 这是整个产品唯一的收集系统，也刻意是唯一的。它不是积分、不是排行榜、
 * 不是连续打卡天数——那些会把"我想再讲一个故事"换成"我不想断"。
 * 地图上只有六个空位和六张贴纸：贴满了，这段旅程就结束了。
 */

/**
 * 六个站点在地图上的落点（百分比）。手工摆的，不等距——地图本来就不规整。
 *
 * 摆位的硬约束：贴纸渲染成 128px，在约 875 宽的地图上就是 14.6% 的直径，
 * 所以站点横向间距不能小于 15%，否则相邻两张会压边。三站扩到六站后
 * x 只能落在 10%~88% 这一段（间距 15.6%）：右端再往外，最后一张就会顶到
 * 地图纸的边框上。y 在 33%~68% 之间上下交替，让路径蛇形穿过而不是排成一行。
 */
const STOPS: Record<StickerId, { x: number; y: number; tilt: number }> = {
  picnic: { x: 10, y: 66, tilt: -7 },
  raincoat: { x: 26, y: 34, tilt: 5 },
  ball: { x: 41, y: 68, tilt: -4 },
  breakfast: { x: 57, y: 33, tilt: 6 },
  toybox: { x: 72, y: 67, tilt: -5 },
  puppy: { x: 88, y: 36, tilt: 8 },
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
           * 地貌全部让开六个站点。站点圆心（svg 坐标）与它们各自吃掉的 128 见方：
           *   100,343 · 260,177 · 410,354 · 570,172 · 720,348 · 880,187
           * 六站比三站密得多，中间那几道缝（x 174~206、334~366、…）只有 32 宽，
           * 放不下一棵 40 宽的树。所以地貌全部压进两条带：
           *   顶带 y < 105（站点最高只吃到 y=108）和底带 y > 410（最低吃到 y=418）。
           * 第一版把湖画在正中间，结果第二张贴纸的虚线框正好压在湖上，
           * 空位看不出来是空位——扩到六站后这个雷区只会更大，故按带布局。
           */}

          {/* 左上：湖。压扁并上移到顶带，给第二站（270,177）让出下缘 */}
          <path d="M64 82 q62 -34 128 -8 q50 22 10 52 q-76 24 -138 -4 Z" fill="#cfe0e7" stroke="#2e2a26" strokeWidth="4" />
          <g stroke="#7fb8d0" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M96 96 q16 -7 30 0 M138 102 q16 -7 30 0" />
          </g>

          {/* 顶带中段：山。原先在右上，那里现在是第六站，只能往中间挪 */}
          <g fill="#a8bda2" stroke="#2e2a26" strokeWidth="4" strokeLinejoin="round">
            <path d="M398 98 l52 -62 l52 62 Z" />
            <path d="M468 100 l46 -52 l46 52 Z" />
          </g>
          <path d="M430 60 l20 -24 l20 24 q-20 9 -40 0 Z" fill="#fbf7ec" stroke="none" />

          {/* 底带：小溪。比原来再低一点，压在树根下方 */}
          <path d="M44 470 Q230 442 330 476 Q430 502 620 482 Q800 458 950 478" fill="none" stroke="#7fb8d0" strokeWidth="13" strokeLinecap="round" />

          {/* 散落的树。位置手摆的，全部落在顶带或底带，避开六个站点和路径 */}
          <g stroke="#2e2a26" strokeWidth="3.5" strokeLinejoin="round">
            {[
              // 顶带：避开湖（64~192）与山（398~560）
              [250, 78], [330, 72], [620, 72], [700, 80], [790, 70],
              // 底带：树根 y+26 仍在纸内，树顶 y-34 不碰站点最低的 418
              [120, 448], [300, 445], [470, 452], [620, 450], [860, 448],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <path d={`M${x} ${y} l-2 26`} stroke="#8a6236" strokeWidth="6" strokeLinecap="round" />
                <path d={`M${x} ${y - 34} l-20 36 l40 0 Z`} fill="#6fae6a" />
              </g>
            ))}
          </g>

          {/* 蜿蜒的路：蛇形串起六个站点 */}
          <path
            d="M100 343 Q180 300 260 177 Q335 250 410 354 Q490 260 570 172 Q645 250 720 348 Q800 280 880 187"
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
