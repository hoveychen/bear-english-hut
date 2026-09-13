import { useId } from 'react'
import './Bear.css'

/** 小熊的表情。设计文档 §7 点名要的四种是 困惑/惊讶/等待/满意，
 *  另加 neutral / talking / sad 覆盖旁白与共情时刻。 */
export type BearMood =
  | 'neutral'
  | 'happy'
  | 'confused'
  | 'surprised'
  | 'waiting'
  | 'thinking'
  | 'sad'
  | 'talking'

/** 小熊的身体动作。对应内容层 Beat.characterAnimation。 */
export type BearAction = 'idle' | 'wave' | 'bounce' | 'lean' | 'shrug' | 'cheer'

type Props = {
  mood?: BearMood
  action?: BearAction
  /** 让小熊穿上衣服（场景二用）。传 objects 目录里的素材 URL。 */
  wearing?: string | null
  /** 让小熊举着一样东西（场景一/三用）。 */
  holding?: string | null
  size?: number
  className?: string
}

/* ── 表情表 ──────────────────────────────────────────────
 * 每种心情只调三件事：眼睛、眉毛、嘴。身体保持不变，这样表情切换
 * 读起来是"同一只熊换了神色"，而不是换了一张图。
 */
const EYES: Record<BearMood, { rx: number; ry: number; shine: boolean; closed?: boolean }> = {
  neutral: { rx: 6, ry: 7, shine: true },
  happy: { rx: 7, ry: 3, shine: false, closed: true },
  confused: { rx: 6, ry: 7, shine: true },
  surprised: { rx: 9, ry: 10, shine: true },
  waiting: { rx: 6.5, ry: 8, shine: true },
  thinking: { rx: 6, ry: 6, shine: true },
  sad: { rx: 6, ry: 6, shine: true },
  talking: { rx: 6, ry: 7, shine: true },
}

/** 眉毛：两条短线的 [左眉旋转, 右眉旋转, 垂直偏移]。 */
const BROWS: Record<BearMood, [number, number, number]> = {
  neutral: [0, 0, 0],
  happy: [-6, 6, -2],
  confused: [-20, 6, -3],
  surprised: [-8, 8, -7],
  waiting: [4, -4, -1],
  thinking: [-14, 2, -2],
  sad: [16, -16, 2],
  talking: [-4, 4, -1],
}

/** 嘴：一条路径。绘本里嘴是最会说话的一笔。 */
const MOUTHS: Record<BearMood, string> = {
  neutral: 'M88 116 Q100 123 112 116',
  happy: 'M84 113 Q100 132 116 113',
  confused: 'M88 120 Q95 113 101 119 Q107 125 113 117',
  surprised: 'M100 120 m-9 0 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0',
  waiting: 'M90 118 Q100 121 110 118',
  thinking: 'M89 119 Q99 115 110 120',
  sad: 'M87 124 Q100 112 113 124',
  talking: 'M89 114 Q100 128 111 114 Q100 121 89 114',
}

export function Bear({
  mood = 'neutral',
  action = 'idle',
  wearing = null,
  holding = null,
  size = 260,
  className = '',
}: Props) {
  // 每个实例拿自己的 filter / gradient id，避免同页多只熊互相覆盖定义。
  const uid = useId().replace(/:/g, '')
  const eye = EYES[mood]
  const [browL, browR, browDy] = BROWS[mood]

  return (
    <svg
      className={`bear bear--${action} bear--mood-${mood} ${className}`}
      viewBox="0 0 200 250"
      width={size}
      height={(size * 250) / 200}
      role="img"
      aria-label="小熊"
    >
      <defs>
        {/* 手绘感的核心：一点点湍流位移，让每条轮廓都轻微走形，
            像蜡笔画在粗纹纸上，而不是矢量工具画的完美曲线。 */}
        <filter id={`crayon-${uid}`} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g filter={`url(#crayon-${uid})`}>
        {/* 地面上的软影：让小熊站在场景里，而不是浮在上面 */}
        <ellipse cx="100" cy="238" rx="56" ry="9" fill="#2e2a26" opacity="0.13" />

        <g className="bear__body">
          {/* 耳朵先画，压在头下面 */}
          <g className="bear__ears">
            <circle cx="58" cy="42" r="21" fill="#b5793f" stroke="#2e2a26" strokeWidth="4" />
            <circle cx="58" cy="42" r="11" fill="#d9a878" />
            <circle cx="142" cy="42" r="21" fill="#b5793f" stroke="#2e2a26" strokeWidth="4" />
            <circle cx="142" cy="42" r="11" fill="#d9a878" />
          </g>

          {/* 腿 */}
          <ellipse cx="74" cy="222" rx="21" ry="15" fill="#a86e38" stroke="#2e2a26" strokeWidth="4" />
          <ellipse cx="126" cy="222" rx="21" ry="15" fill="#a86e38" stroke="#2e2a26" strokeWidth="4" />

          {/* 躯干 */}
          <ellipse cx="100" cy="176" rx="54" ry="52" fill="#b5793f" stroke="#2e2a26" strokeWidth="4.5" />
          <ellipse cx="100" cy="184" rx="33" ry="34" fill="#ead3ae" />

          {/* 手臂。左臂单独分组，wave 动作只转它。 */}
          <g className="bear__arm bear__arm--left">
            <ellipse cx="52" cy="168" rx="16" ry="27" fill="#a86e38" stroke="#2e2a26" strokeWidth="4" transform="rotate(14 52 168)" />
          </g>
          <g className="bear__arm bear__arm--right">
            <ellipse cx="148" cy="168" rx="16" ry="27" fill="#a86e38" stroke="#2e2a26" strokeWidth="4" transform="rotate(-14 148 168)" />
          </g>

          {/* 头 */}
          <g className="bear__head">
            <circle cx="100" cy="80" r="53" fill="#c1854a" stroke="#2e2a26" strokeWidth="4.5" />
            {/* 口鼻部 */}
            <ellipse cx="100" cy="106" rx="30" ry="24" fill="#ead3ae" stroke="#2e2a26" strokeWidth="3" />
            {/* 鼻子 */}
            <path d="M91 96 Q100 89 109 96 Q105 104 100 104 Q95 104 91 96 Z" fill="#2e2a26" />

            {/* 眉毛 */}
            <g stroke="#2e2a26" strokeWidth="3.6" strokeLinecap="round" className="bear__brows">
              <line x1="68" y1={54 + browDy} x2="86" y2={54 + browDy} transform={`rotate(${browL} 77 ${54 + browDy})`} />
              <line x1="114" y1={54 + browDy} x2="132" y2={54 + browDy} transform={`rotate(${browR} 123 ${54 + browDy})`} />
            </g>

            {/* 眼睛 */}
            <g className="bear__eyes">
              {eye.closed ? (
                <>
                  <path d="M71 72 Q80 63 89 72" fill="none" stroke="#2e2a26" strokeWidth="4" strokeLinecap="round" />
                  <path d="M111 72 Q120 63 129 72" fill="none" stroke="#2e2a26" strokeWidth="4" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <ellipse cx="80" cy="72" rx={eye.rx} ry={eye.ry} fill="#2e2a26" />
                  <ellipse cx="120" cy="72" rx={eye.rx} ry={eye.ry} fill="#2e2a26" />
                  {eye.shine && (
                    <>
                      <circle cx="82.4" cy="69" r="2.1" fill="#fbf7ec" />
                      <circle cx="122.4" cy="69" r="2.1" fill="#fbf7ec" />
                    </>
                  )}
                </>
              )}
            </g>

            {/* 嘴 */}
            <path
              className="bear__mouth"
              d={MOUTHS[mood]}
              fill={mood === 'surprised' || mood === 'talking' ? '#8c4a3c' : 'none'}
              stroke="#2e2a26"
              strokeWidth="3.4"
              strokeLinecap="round"
            />

            {/* 腮红：只在开心和惊讶时出现，是奖励瞬间的一部分 */}
            {(mood === 'happy' || mood === 'surprised') && (
              <>
                <ellipse cx="60" cy="95" rx="9" ry="6" fill="#dc5b3c" opacity="0.32" />
                <ellipse cx="140" cy="95" rx="9" ry="6" fill="#dc5b3c" opacity="0.32" />
              </>
            )}
          </g>
        </g>

        {/* 思考时头顶冒问号，替代文字提示（孩子端无文字） */}
        {(mood === 'thinking' || mood === 'confused') && (
          <g className="bear__think">
            <circle cx="156" cy="26" r="4" fill="none" stroke="#235a79" strokeWidth="3" />
            <circle cx="168" cy="14" r="6" fill="none" stroke="#235a79" strokeWidth="3" />
            <path d="M175 -4 q7 -6 12 1 q4 6 -5 10 v5" fill="none" stroke="#235a79" strokeWidth="3.4" strokeLinecap="round" />
          </g>
        )}
      </g>

      {/* 穿戴 / 手持的物品叠在熊身上。不过 crayon filter，
          否则外部素材的细节会被抖糊。 */}
      {wearing && <image href={wearing} x="52" y="140" width="96" height="96" className="bear__wearing" />}
      {holding && <image href={holding} x="122" y="146" width="62" height="62" className="bear__holding" />}
    </svg>
  )
}
