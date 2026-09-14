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
  const outdoor = id === 'meadow' || id === 'zoo'
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
        {id === 'supermarket' && <Supermarket />}
        {id === 'zoo' && <Zoo />}
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
      <rect width="1000" height="450" fill="#e9edd9" />
      {/* 瓷砖：故意画歪，别做成 pattern */}
      <g stroke="#cdd4b6" strokeWidth="4">
        {[80, 160, 240, 320, 400].map((y) => (
          <path key={y} d={`M0 ${y} Q500 ${y - 6} 1000 ${y + 4}`} fill="none" />
        ))}
        {[0, 140, 280, 420, 560, 700, 840, 980].map((x) => (
          <path key={x} d={`M${x} 0 Q${x + 5} 220 ${x - 3} 440`} fill="none" />
        ))}
      </g>

      {/*
       * 吊柜和窗都吊在 y < 300 的墙上：小熊站在左侧（CSS left:16%，约占 x 78~242）、
       * 物品全部落在 y > 450 的台面上，所以这一带是整面墙唯一不会被挡住的地方。
       */}
      <g fill="#d9bc93" stroke="#2e2a26" strokeWidth="6" strokeLinejoin="round">
        <rect x="30" y="60" width="240" height="130" rx="6" />
        <rect x="730" y="60" width="240" height="130" rx="6" />
      </g>
      <g stroke="#2e2a26" strokeWidth="4" fill="none">
        <path d="M150 60 L150 190 M850 60 L850 190" />
      </g>
      <g fill="#2e2a26">
        <rect x="132" y="150" width="6" height="26" rx="3" />
        <rect x="162" y="150" width="6" height="26" rx="3" />
        <rect x="832" y="150" width="6" height="26" rx="3" />
        <rect x="862" y="150" width="6" height="26" rx="3" />
      </g>

      {/* 窗：早餐时天刚亮，所以只给一片素净的天。不登记进 WINDOW 表——
          厨房故事不带天气，登记了反而要为一个永远不画的图层留分支。 */}
      <rect x="390" y="72" width="230" height="176" rx="8" fill="#cfe6ef" stroke="#2e2a26" strokeWidth="7" />
      <path d="M505 72 L505 248 M390 160 L620 160" stroke="#2e2a26" strokeWidth="6" />
      <path d="M372 248 L638 248" stroke="#a86e38" strokeWidth="12" strokeLinecap="round" />

      {/*
       * 台面顶面压在 y=450 —— 和 home 的地板线同高。
       * 物品是固定 108px、按中心定位的，所以它们会像在别的房间一样略微"陷进"
       * 这条线；台面若像初版那样只有 60 高，物品就会一路插进柜门里。
       */}
      <rect y="450" width="1000" height="30" fill="#d9a86a" stroke="#2e2a26" strokeWidth="6" />
      <rect y="480" width="1000" height="104" fill="#c98c4e" />
      <g stroke="#a86e38" strokeWidth="5" fill="none">
        <path d="M250 484 L250 580 M560 484 L560 580 M820 484 L820 580" />
      </g>
      <g fill="#2e2a26">
        <rect x="222" y="512" width="24" height="7" rx="3.5" />
        <rect x="532" y="512" width="24" height="7" rx="3.5" />
        <rect x="792" y="512" width="24" height="7" rx="3.5" />
      </g>
      <rect y="584" width="1000" height="70" fill="#a86e38" />
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

/**
 * 超市。室内，所以地板线和 home 一样压在 y=450——舞台物品是固定 108px 按中心
 * 定位的，各个房间的地面线不统一，同一套 y 坐标就会在这个场景里浮起来。
 *
 * 货架全部挂在 y<430 的墙上：小熊站在左侧（约占 x 78~242），物品带在 y>450，
 * 这两块都不能压。**货架上一个字都不能有**——孩子端是无文字的（设计文档 §7），
 * 价签和促销牌一律画成色块。
 */
function Supermarket() {
  /* 货架上的商品：三层，每层一排歪歪扭扭的彩色盒子。手摆的，不做成循环等距。 */
  const shelves = [
    { y: 150, items: [[330, '#dc5b3c'], [380, '#e9a13b'], [424, '#5b8fa8'], [478, '#dc5b3c'], [524, '#6fae6a'], [576, '#e9a13b'], [626, '#5b8fa8'], [676, '#dc5b3c'], [724, '#6fae6a'], [776, '#e9a13b'], [826, '#5b8fa8'], [876, '#dc5b3c'], [926, '#6fae6a']] },
    { y: 250, items: [[336, '#6fae6a'], [386, '#5b8fa8'], [430, '#dc5b3c'], [482, '#e9a13b'], [530, '#6fae6a'], [580, '#dc5b3c'], [630, '#e9a13b'], [682, '#5b8fa8'], [730, '#dc5b3c'], [780, '#6fae6a'], [830, '#e9a13b'], [880, '#5b8fa8'], [930, '#dc5b3c']] },
    { y: 350, items: [[332, '#e9a13b'], [382, '#dc5b3c'], [428, '#6fae6a'], [480, '#5b8fa8'], [528, '#e9a13b'], [578, '#6fae6a'], [628, '#dc5b3c'], [678, '#e9a13b'], [728, '#5b8fa8'], [778, '#dc5b3c'], [828, '#6fae6a'], [878, '#e9a13b'], [928, '#5b8fa8']] },
  ] as const

  return (
    <>
      <rect width="1000" height="450" fill="#eaeef0" />

      {/* 吊顶灯。两盏，各有吊杆和灯罩——只画一条横线的话看着像飘在半空的绳子 */}
      {[[330, 30], [760, 36]].map(([cx, top]) => (
        <g key={cx}>
          <path d={`M${cx} 0 L${cx - 2} ${top}`} stroke="#2e2a26" strokeWidth="5" strokeLinecap="round" />
          <path
            d={`M${cx - 84} ${top + 34} L${cx - 58} ${top} L${cx + 58} ${top} L${cx + 84} ${top + 34} Z`}
            fill="#f3e9c8"
            stroke="#2e2a26"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d={`M${cx - 80} ${top + 34} Q${cx} ${top + 42} ${cx + 80} ${top + 34}`} fill="none" stroke="#e9a13b" strokeWidth="7" strokeLinecap="round" />
        </g>
      ))}

      {/* 左墙那面彩色横幅。无字，纯色块——孩子端不出现文字 */}
      <g stroke="#2e2a26" strokeWidth="5" strokeLinejoin="round">
        <path d="M40 120 L250 112 L250 178 L40 186 Z" fill="#fbf7ec" />
        <circle cx="88" cy="150" r="17" fill="#dc5b3c" />
        <circle cx="145" cy="147" r="17" fill="#e9a13b" />
        <circle cx="202" cy="150" r="17" fill="#6fae6a" />
      </g>

      {/* 货架本体 */}
      <g>
        {shelves.map(({ y, items }) => (
          <g key={y}>
            {items.map(([x, fill]) => (
              <rect
                key={`${x}`}
                x={x as number}
                y={y - 40}
                width="38"
                height="40"
                rx="3"
                fill={fill as string}
                stroke="#2e2a26"
                strokeWidth="3.4"
              />
            ))}
            {/* 隔板：故意不是直线 */}
            <path d={`M300 ${y} Q650 ${y - 7} 990 ${y + 4}`} fill="none" stroke="#a86e38" strokeWidth="11" strokeLinecap="round" />
          </g>
        ))}
        {/* 两根立柱把三层串成一个柜子 */}
        <path d="M308 110 Q304 270 310 428" fill="none" stroke="#a86e38" strokeWidth="10" strokeLinecap="round" />
        <path d="M982 104 Q986 268 980 424" fill="none" stroke="#a86e38" strokeWidth="10" strokeLinecap="round" />
      </g>

      {/* 地板。压在 450，与 home 同高 */}
      <rect y="450" width="1000" height="30" fill="#d9cdb4" stroke="#2e2a26" strokeWidth="5" />
      <rect y="480" width="1000" height="140" fill="#c9bfa6" />
      {/* 地砖缝，画歪 */}
      <g stroke="#b3a88e" strokeWidth="4" fill="none">
        <path d="M130 484 Q124 550 134 618" />
        <path d="M380 484 Q374 550 384 618" />
        <path d="M630 484 Q624 550 634 618" />
        <path d="M880 484 Q874 550 884 618" />
        <path d="M0 548 Q500 540 1000 552" />
      </g>
    </>
  )
}

/**
 * 动物园。户外，所以走 outdoor 分支拿天空底色、天气也画得出来。
 *
 * 围栏压在 y=430：物品要站在围栏**前面**的地上（y>450），围栏本身得再高一点，
 * 否则 108px 的动物会把栏杆整根盖住。
 */
function Zoo() {
  return (
    <>
      {/* 远山与树丛 */}
      <path d="M-20 300 Q160 236 340 296 Q520 240 700 300 Q860 256 1020 304 L1020 640 L-20 640 Z" fill="#9cc294" />
      <g stroke="#2e2a26" strokeWidth="4" strokeLinejoin="round">
        {[[90, 300], [190, 286], [286, 302], [392, 290], [496, 304], [600, 288], [694, 300], [790, 286], [890, 302], [966, 292]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <path d={`M${x} ${y} l-3 34`} stroke="#8a6236" strokeWidth="9" strokeLinecap="round" />
            <circle cx={x} cy={y - 26} r="34" fill="#6fae6a" />
            <circle cx={x - 22} cy={y - 8} r="24" fill="#589a57" />
            <circle cx={x + 22} cy={y - 10} r="23" fill="#7bb873" />
          </g>
        ))}
      </g>

      {/* 草地 */}
      <path d="M-20 372 Q250 340 520 376 Q760 404 1020 368 L1020 640 L-20 640 Z" fill="#6fae6a" />
      <path d="M-20 440 Q260 412 540 446 Q790 472 1020 436 L1020 640 L-20 640 Z" fill="#589a57" />

      {/* 围栏：横梁 + 一排削尖的木桩，桩子高矮不一 */}
      <g stroke="#2e2a26" strokeWidth="4.5" strokeLinejoin="round">
        {Array.from({ length: 17 }, (_, i) => {
          const x = 20 + i * 60
          const top = 330 + ((i * 37) % 13)
          return <path key={x} d={`M${x} ${top} l13 -16 l13 16 l0 96 l-26 0 Z`} fill="#c98c4e" />
        })}
      </g>
      <path d="M8 372 Q500 362 1000 376" fill="none" stroke="#a86e38" strokeWidth="12" strokeLinecap="round" />
      <path d="M8 412 Q500 402 1000 416" fill="none" stroke="#a86e38" strokeWidth="12" strokeLinecap="round" />

      {/* 栏前草丛，遮住桩脚，让围栏像插在地里 */}
      <g stroke="#3f7a43" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M70 452 q6 -26 2 -40 M82 454 q16 -22 22 -34 M58 454 q-10 -20 -18 -30" />
        <path d="M430 460 q6 -26 2 -40 M442 462 q16 -22 22 -34 M418 462 q-10 -20 -18 -30" />
        <path d="M880 456 q6 -26 2 -40 M892 458 q16 -22 22 -34 M868 458 q-10 -20 -18 -30" />
      </g>
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
