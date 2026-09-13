import type { BackdropId } from '../content/types'
import './Backdrop.css'

/**
 * 手绘背景。每个场地只画到"认得出是哪里"为止——
 * 舞台的主角是小熊和可操作的物品，背景再热闹就会抢戏。
 */

type Props = {
  id: BackdropId
  weather: 'sun' | 'rain' | 'snow' | null
}

/**
 * 室内场地的窗口区域。天气**只**画在这里面。
 *
 * 第一版把雨云和雨点铺满整张舞台，于是卧室里下起了雨、灰色云层盖掉了半面墙。
 * 天气在室内的正确表达是"从窗户看出去"——所以有窗的场地把天气裁进窗框，
 * 没窗的场地（厨房、客厅）干脆不画天气。
 */
const WINDOW: Partial<Record<BackdropId, { x: number; y: number; w: number; h: number }>> = {
  home: { x: 527, y: 93, w: 216, h: 162 },
  bedroom: { x: 667, y: 87, w: 216, h: 166 },
}

export function Backdrop({ id, weather }: Props) {
  const outdoor = id === 'meadow'
  const win = WINDOW[id]
  const showWeather = weather !== null && (outdoor || !!win)

  return (
    <svg className="backdrop" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bd-crayon" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {win && (
          <clipPath id={`bd-win-${id}`}>
            <rect x={win.x} y={win.y} width={win.w} height={win.h} />
          </clipPath>
        )}
      </defs>

      {/* 天空 / 墙面的底色随场地变 */}
      <rect width="1000" height="620" fill={outdoor ? '#cfe6ef' : '#f2e6cd'} />

      <g filter="url(#bd-crayon)">
        {id === 'meadow' && <Meadow />}
        {id === 'home' && <Home />}
        {id === 'kitchen' && <Kitchen />}
        {id === 'bedroom' && <Bedroom />}
        {id === 'livingroom' && <LivingRoom />}
      </g>

      {showWeather && (
        <g clipPath={win ? `url(#bd-win-${id})` : undefined}>
          {weather === 'sun' && <Sun inWindow={!!win} win={win} />}
          {weather === 'rain' && <Rain inWindow={!!win} win={win} />}
          {weather === 'snow' && <Snow inWindow={!!win} win={win} />}
        </g>
      )}
    </svg>
  )
}

type Frame = { x: number; y: number; w: number; h: number } | undefined

function Meadow() {
  return (
    <>
      {/* 远山 */}
      <path d="M-20 330 Q140 244 300 320 Q420 262 560 322 Q720 250 880 324 Q960 300 1020 330 L1020 640 L-20 640 Z" fill="#8fbf87" />
      {/* 近草地 */}
      <path d="M-20 400 Q250 356 520 402 Q760 440 1020 396 L1020 640 L-20 640 Z" fill="#6fae6a" />
      <path d="M-20 470 Q260 440 540 476 Q790 506 1020 468 L1020 640 L-20 640 Z" fill="#589a57" />
      {/* 几丛草，手画的那种三笔 */}
      <g stroke="#3f7a43" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M120 500 q6 -26 2 -40 M132 502 q16 -22 22 -34 M108 502 q-10 -20 -18 -30" />
        <path d="M640 486 q6 -26 2 -40 M652 488 q16 -22 22 -34 M628 488 q-10 -20 -18 -30" />
        <path d="M880 512 q6 -26 2 -40 M892 514 q16 -22 22 -34" />
      </g>
    </>
  )
}

function Home() {
  return (
    <>
      <rect y="0" width="1000" height="430" fill="#eddfc0" />
      {/* 墙裙 */}
      <rect y="410" width="1000" height="40" fill="#d6c39c" />
      <rect y="450" width="1000" height="200" fill="#c9a878" />
      {/* 窗。故意往左让开右上角——那里是太阳/雨云的固定位置，压上去两个图形会糊成一团 */}
      <g>
        <rect x="520" y="86" width="230" height="176" rx="8" fill="#bfe0ea" stroke="#2e2a26" strokeWidth="7" />
        <path d="M635 86 L635 262 M520 174 L750 174" stroke="#2e2a26" strokeWidth="6" />
        <path d="M502 262 L768 262" stroke="#a86e38" strokeWidth="12" strokeLinecap="round" />
      </g>
      {/* 门 */}
      <rect x="100" y="130" width="160" height="320" rx="6" fill="#b5793f" stroke="#2e2a26" strokeWidth="7" />
      <circle cx="232" cy="296" r="9" fill="#e9a13b" stroke="#2e2a26" strokeWidth="4" />
    </>
  )
}

function Kitchen() {
  return (
    <>
      <rect width="1000" height="420" fill="#e9edd9" />
      {/* 瓷砖：故意画歪，别做成 pattern */}
      <g stroke="#cdd4b6" strokeWidth="4">
        {[80, 160, 240, 320].map((y) => (
          <path key={y} d={`M0 ${y} Q500 ${y - 6} 1000 ${y + 4}`} fill="none" />
        ))}
        {[0, 140, 280, 420, 560, 700, 840, 980].map((x) => (
          <path key={x} d={`M${x} 0 Q${x + 5} 200 ${x - 3} 400`} fill="none" />
        ))}
      </g>
      <rect y="420" width="1000" height="60" fill="#c98c4e" stroke="#2e2a26" strokeWidth="6" />
      <rect y="480" width="1000" height="170" fill="#a86e38" />
    </>
  )
}

function Bedroom() {
  return (
    <>
      <rect width="1000" height="440" fill="#efe0e6" />
      {/* 竖条纹壁纸 */}
      <g stroke="#e2cbd4" strokeWidth="16">
        {[60, 180, 300, 420, 540, 660, 780, 900].map((x) => (
          <path key={x} d={`M${x} 0 Q${x + 8} 220 ${x - 4} 440`} fill="none" />
        ))}
      </g>
      {/* 窗 */}
      <rect x="660" y="80" width="230" height="180" rx="8" fill="#bfe0ea" stroke="#2e2a26" strokeWidth="7" />
      <path d="M775 80 L775 260 M660 170 L890 170" stroke="#2e2a26" strokeWidth="6" />
      {/* 衣柜 */}
      <rect x="70" y="120" width="230" height="330" rx="8" fill="#c98c4e" stroke="#2e2a26" strokeWidth="7" />
      <path d="M185 120 L185 450" stroke="#2e2a26" strokeWidth="5" />
      <circle cx="165" cy="292" r="8" fill="#2e2a26" />
      <circle cx="205" cy="292" r="8" fill="#2e2a26" />
      <rect y="440" width="1000" height="210" fill="#d9bc93" />
    </>
  )
}

function LivingRoom() {
  return (
    <>
      <rect width="1000" height="440" fill="#f0e4cc" />
      <rect y="430" width="1000" height="220" fill="#b98f5f" />
      {/* 地毯 */}
      <ellipse cx="500" cy="560" rx="400" ry="72" fill="#dc5b3c" opacity="0.55" />
      {/* 挂画：小熊的全家福 */}
      <g>
        <rect x="380" y="80" width="180" height="140" rx="6" fill="#fbf7ec" stroke="#a86e38" strokeWidth="10" />
        <circle cx="445" cy="150" r="28" fill="#c1854a" />
        <circle cx="500" cy="160" r="20" fill="#d9a878" />
      </g>
      {/* 落地灯。摆在 x≈330——右侧 36%–92% 是可操作物品的地面带，
          原先放在 880 正好和"箱子"这件道具叠在一起 */}
      <path d="M330 440 L330 250" stroke="#2e2a26" strokeWidth="8" strokeLinecap="round" />
      <path d="M290 250 L370 250 L355 190 L305 190 Z" fill="#e9a13b" stroke="#2e2a26" strokeWidth="6" strokeLinejoin="round" />
      <path d="M295 445 Q330 432 365 445" stroke="#2e2a26" strokeWidth="8" strokeLinecap="round" fill="none" />
    </>
  )
}

function Sun({ inWindow, win }: { inWindow: boolean; win: Frame }) {
  const cx = inWindow && win ? win.x + win.w * 0.72 : 870
  const cy = inWindow && win ? win.y + win.h * 0.28 : 105
  const r = inWindow ? 30 : 52
  return (
    <g className="bd-sun" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <circle cx={cx} cy={cy} r={r} fill="#e9a13b" stroke="#2e2a26" strokeWidth={inWindow ? 4 : 6} />
      <g stroke="#e9a13b" strokeWidth={inWindow ? 6 : 9} strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * (r * 1.27)}
              y1={cy + Math.sin(a) * (r * 1.27)}
              x2={cx + Math.cos(a) * (r * 1.69)}
              y2={cy + Math.sin(a) * (r * 1.69)}
            />
          )
        })}
      </g>
    </g>
  )
}

/** 天气图层在窗内时以窗框为画布，在室外时铺满舞台上半部。 */
function frameOf(inWindow: boolean, win: Frame) {
  return inWindow && win ? win : { x: 0, y: 0, w: 1000, h: 420 }
}

function Rain({ inWindow, win }: { inWindow: boolean; win: Frame }) {
  const f = frameOf(inWindow, win)
  // 雨滴位置用确定值而非 random，避免每次 render 雨点乱跳
  const n = inWindow ? 14 : 26
  const drops = Array.from({ length: n }, (_, i) => ({
    x: f.x + ((i * 137) % f.w),
    y: f.y + ((i * 83) % f.h),
    d: (i % 5) * 0.24,
  }))
  const len = inWindow ? 12 : 22
  return (
    <g className="bd-rain" style={{ ['--fall' as string]: `${f.h * 0.9}px` }}>
      {/* 云层：室内只占窗口顶部一条，不再是盖住半面墙的灰板 */}
      <path
        d={`M${f.x - 20} ${f.y + f.h * 0.12} q${f.w * 0.12} -${f.h * 0.13} ${f.w * 0.24} -0.02 q${f.w * 0.12} ${f.h * 0.11} ${f.w * 0.24} 0 q${f.w * 0.12} -${f.h * 0.11} ${f.w * 0.24} 0.01 q${f.w * 0.12} ${f.h * 0.12} ${f.w * 0.32} -${f.h * 0.03} L${f.x + f.w + 20} ${f.y + f.h * 0.34} L${f.x - 20} ${f.y + f.h * 0.34} Z`}
        fill="#b9c4cc"
        opacity="0.9"
      />
      {drops.map((d, i) => (
        <line
          key={i}
          className="bd-raindrop"
          x1={d.x}
          y1={d.y}
          x2={d.x - len * 0.32}
          y2={d.y + len}
          stroke="#5b8fae"
          strokeWidth={inWindow ? 3 : 4}
          strokeLinecap="round"
          style={{ animationDelay: `${d.d}s` }}
        />
      ))}
    </g>
  )
}

function Snow({ inWindow, win }: { inWindow: boolean; win: Frame }) {
  const f = frameOf(inWindow, win)
  const n = inWindow ? 12 : 22
  const flakes = Array.from({ length: n }, (_, i) => ({
    x: f.x + ((i * 151) % f.w),
    y: f.y + ((i * 97) % f.h),
    r: (inWindow ? 2.5 : 4) + (i % 3) * (inWindow ? 1 : 2),
    d: (i % 6) * 0.3,
  }))
  return (
    <g className="bd-rain" style={{ ['--fall' as string]: `${f.h * 0.9}px` }}>
      {flakes.map((f2, i) => (
        <circle
          key={i}
          className="bd-raindrop"
          cx={f2.x}
          cy={f2.y}
          r={f2.r}
          fill="#fbf7ec"
          stroke="#b9c4cc"
          strokeWidth="2"
          style={{ animationDelay: `${f2.d}s` }}
        />
      ))}
    </g>
  )
}
