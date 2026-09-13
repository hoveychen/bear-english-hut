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

export function Backdrop({ id, weather }: Props) {
  return (
    <svg className="backdrop" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bd-crayon" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* 天空 / 墙面的底色随场地变 */}
      <rect width="1000" height="620" fill={id === 'meadow' ? '#cfe6ef' : '#f2e6cd'} />

      <g filter="url(#bd-crayon)">
        {id === 'meadow' && <Meadow />}
        {id === 'home' && <Home />}
        {id === 'kitchen' && <Kitchen />}
        {id === 'bedroom' && <Bedroom />}
        {id === 'livingroom' && <LivingRoom />}
      </g>

      {weather === 'sun' && <Sun />}
      {weather === 'rain' && <Rain />}
      {weather === 'snow' && <Snow />}
    </svg>
  )
}

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
      {/* 落地灯 */}
      <path d="M880 440 L880 250" stroke="#2e2a26" strokeWidth="8" strokeLinecap="round" />
      <path d="M840 250 L920 250 L905 190 L855 190 Z" fill="#e9a13b" stroke="#2e2a26" strokeWidth="6" strokeLinejoin="round" />
      <path d="M845 445 Q880 432 915 445" stroke="#2e2a26" strokeWidth="8" strokeLinecap="round" fill="none" />
    </>
  )
}

function Sun() {
  return (
    <g className="bd-sun">
      <circle cx="870" cy="105" r="52" fill="#e9a13b" stroke="#2e2a26" strokeWidth="6" />
      <g stroke="#e9a13b" strokeWidth="9" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4
          return (
            <line
              key={i}
              x1={870 + Math.cos(a) * 66}
              y1={105 + Math.sin(a) * 66}
              x2={870 + Math.cos(a) * 88}
              y2={105 + Math.sin(a) * 88}
            />
          )
        })}
      </g>
    </g>
  )
}

function Rain() {
  // 雨滴位置用确定值而非 random，避免每次 render 雨点乱跳
  const drops = Array.from({ length: 26 }, (_, i) => ({
    x: ((i * 137) % 1000) + 10,
    y: ((i * 83) % 420) + 10,
    d: (i % 5) * 0.24,
  }))
  return (
    <g className="bd-rain">
      <path d="M-20 60 q120 -46 240 -6 q120 40 240 0 q120 -40 240 4 q120 44 320 -10 L1020 200 L-20 200 Z" fill="#b9c4cc" opacity="0.9" />
      {drops.map((d, i) => (
        <line
          key={i}
          className="bd-raindrop"
          x1={d.x}
          y1={d.y}
          x2={d.x - 7}
          y2={d.y + 22}
          stroke="#5b8fae"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ animationDelay: `${d.d}s` }}
        />
      ))}
    </g>
  )
}

function Snow() {
  const flakes = Array.from({ length: 22 }, (_, i) => ({
    x: ((i * 151) % 1000) + 12,
    y: ((i * 97) % 400) + 12,
    r: 4 + (i % 3) * 2,
    d: (i % 6) * 0.3,
  }))
  return (
    <g className="bd-rain">
      {flakes.map((f, i) => (
        <circle key={i} className="bd-raindrop" cx={f.x} cy={f.y} r={f.r} fill="#fbf7ec" stroke="#b9c4cc" strokeWidth="2" style={{ animationDelay: `${f.d}s` }} />
      ))}
    </g>
  )
}
