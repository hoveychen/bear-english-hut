import { useEffect, useState } from 'react'

import './HandHint.css'

/**
 * 第一次玩时的无文字演示：一只手指，指着此刻真正该碰的东西。
 *
 * 为什么不是一段预录的教程动画：这个游戏对孩子唯一的要求就是"先点一个东西、
 * 再按住麦克风说话"，而这两步在状态机里本来就有各自的阶段（observe / invite）。
 * 手指跟着阶段走，指的就永远是此刻真正该碰的那个控件——孩子做完一步，手指
 * 自己挪到下一步，不需要她先看完一段演示再回来对照。
 *
 * 一个字都不写（设计文档 §7 的无文字规约）：`tap` 是点一下就弹起，
 * `hold` 是按下去不放、涟漪一圈圈往外推——两个动作的差别全靠动画本身说清楚。
 */

type Props = {
  /** CSS 选择器，指向此刻该碰的元素 */
  target: string
  /** tap = 点一下；hold = 按住不放 */
  gesture: 'tap' | 'hold'
}

type Spot = { x: number; y: number; above: boolean }

export function HandHint({ target, gesture }: Props) {
  const [spot, setSpot] = useState<Spot | null>(null)

  useEffect(() => {
    let raf = 0

    const locate = () => {
      const el = document.querySelector(target)
      if (!el) {
        setSpot(null)
        return
      }
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) {
        setSpot(null)
        return
      }
      const cy = r.top + r.height / 2
      /*
       * 目标贴着屏幕底边时（麦克风就永远贴着），手要改成从上方指下来。
       * 否则那只手会伸到视口外面，孩子只看得到一截指尖。
       */
      setSpot({ x: r.left + r.width / 2, y: cy, above: cy > window.innerHeight - 150 })
    }

    /*
     * 每帧重新量，而不是量一次就记住。
     *
     * 舞台上的物品自己会动（被选中时会放大、被高亮时会跳），麦克风在听的时候
     * 也在变大；量一次的话手指会停在旧位置，指着旁边的空气。
     */
    const loop = () => {
      locate()
      raf = window.requestAnimationFrame(loop)
    }
    loop()
    return () => window.cancelAnimationFrame(raf)
  }, [target])

  if (!spot) return null

  return (
    <div
      className={`hint hint--${gesture} ${spot.above ? 'hint--above' : ''}`}
      style={{ left: `${spot.x}px`, top: `${spot.y}px` }}
      aria-hidden="true"
    >
      <span className="hint__ring" />
      {/*
       * 指尖画在 SVG 的 (22, 5)，CSS 用负偏移把这个点搬到目标中心——
       * 对齐的是**指尖**，不是这张图的外框，否则手看着总像指在东西旁边。
       */}
      <span className="hint__hand">
        <svg className="hint__handArt" viewBox="0 0 76 96" width="76" height="96">
          {/* 握起来的拳 */}
          <path
            d="M12 46 Q8 50 8 60 L8 70 Q8 88 30 91 L46 91 Q64 89 64 70 L64 52 Q64 44 55 44 L20 44 Q14 44 12 46 Z"
          fill="#f3d9b5"
          stroke="#2e2a26"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
          {/* 伸出来的食指，压在拳头上方 */}
          <path
            d="M13 54 L13 14 a9 9 0 0 1 18 0 L31 54 Z"
          fill="#f3d9b5"
          stroke="#2e2a26"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        {/* 其余手指的关节，两道就够，多了就糊 */}
          <path d="M38 58 L53 58 M38 70 L52 70" fill="none" stroke="#2e2a26" strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
        </svg>
      </span>
    </div>
  )
}
