/**
 * 手绘道具与贴纸。
 *
 * 这里只放**没有现成 emoji 素材**的东西（毯子、餐桌），以及必须保持统一手绘
 * 调性的东西（三枚故事贴纸）。其余物品走 src/assets/objects 的 OpenMoji 素材。
 */

type ShapeProps = { size?: number; className?: string }

/** 野餐毯。格纹是画出来的，不是 pattern 平铺——绘本里的格子本来就该歪。 */
export function Blanket({ size = 140, className = '' }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 90" width={size} height={(size * 90) / 120} className={className} role="img" aria-label="毯子">
      <path
        d="M8 26 Q60 14 112 26 Q116 56 110 76 Q60 88 10 76 Q4 54 8 26 Z"
        fill="#dc5b3c"
        stroke="#2e2a26"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g stroke="#fbf7ec" strokeWidth="4" opacity="0.75" strokeLinecap="round">
        <path d="M30 19 Q32 50 29 81" fill="none" />
        <path d="M60 16 Q62 50 60 84" fill="none" />
        <path d="M90 19 Q88 50 91 81" fill="none" />
        <path d="M10 42 Q60 34 111 42" fill="none" />
        <path d="M9 62 Q60 55 110 62" fill="none" />
      </g>
      <path
        d="M8 26 Q60 14 112 26 Q116 56 110 76 Q60 88 10 76 Q4 54 8 26 Z"
        fill="none"
        stroke="#2e2a26"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 餐桌（洗水果、切水果的台面）。 */
export function Table({ size = 150, className = '' }: ShapeProps) {
  return (
    <svg viewBox="0 0 130 100" width={size} height={(size * 100) / 130} className={className} role="img" aria-label="桌子">
      <path d="M6 30 Q65 22 124 30 Q124 42 122 44 Q65 52 8 44 Q6 42 6 30 Z" fill="#c98c4e" stroke="#2e2a26" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 46 Q20 72 24 94" fill="none" stroke="#2e2a26" strokeWidth="7" strokeLinecap="round" />
      <path d="M108 46 Q110 72 106 94" fill="none" stroke="#2e2a26" strokeWidth="7" strokeLinecap="round" />
      <path d="M24 66 Q65 62 106 66" fill="none" stroke="#a86e38" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

/** 水盆（洗水果那一步的可操作物）。 */
export function WaterBasin({ size = 120, className = '' }: ShapeProps) {
  return (
    <svg viewBox="0 0 110 80" width={size} height={(size * 80) / 110} className={className} role="img" aria-label="水盆">
      <path d="M10 24 Q55 16 100 24 L90 68 Q55 76 20 68 Z" fill="#eef0f0" stroke="#2e2a26" strokeWidth="3" strokeLinejoin="round" />
      <path d="M16 34 Q55 27 94 34 L88 62 Q55 69 22 62 Z" fill="#5fb0d4" />
      <path d="M20 40 Q34 35 46 41 Q58 47 70 41 Q82 35 90 40" fill="none" stroke="#fbf7ec" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

/**
 * 儿童积木。
 *
 * 这个必须手绘：OpenMoji 里离"积木"最近的码点是 1F9F1，但它画出来是一堵
 * 红砖墙，摆进"收玩具"的房间里孩子只会说 brick。三块叠着的彩色方块才是
 * blocks 这个词指的东西。
 */
export function Blocks({ size = 130, className = '' }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 100" width={size} height={(size * 100) / 120} className={className} role="img" aria-label="积木">
      {/* 底下两块并排，上面压一块——歪一点才像小孩堆的 */}
      <g stroke="#2e2a26" strokeWidth="3.4" strokeLinejoin="round">
        <rect x="14" y="54" width="44" height="36" rx="4" fill="#dc5b3c" transform="rotate(-3 36 72)" />
        <rect x="62" y="56" width="42" height="34" rx="4" fill="#5b8fa8" transform="rotate(2 83 73)" />
        <rect x="38" y="16" width="42" height="36" rx="4" fill="#e9a13b" transform="rotate(-6 59 34)" />
      </g>
      {/* 面上的字母，绘本积木的标配 */}
      <g fill="#fbf7ec" fontFamily="inherit" fontWeight="700" fontSize="19" textAnchor="middle">
        <text x="36" y="79" transform="rotate(-3 36 79)">A</text>
        <text x="83" y="80" transform="rotate(2 83 80)">B</text>
        <text x="59" y="41" transform="rotate(-6 59 41)">C</text>
      </g>
    </svg>
  )
}

/**
 * 按内容层的 `drawn:<name>` 取到对应的手绘道具。
 *
 * 舞台和图片顺序卡都要用它——顺序卡最初只认图片文件 URL，结果"先洗苹果"
 * 那张卡是空的，因为水盆根本没有素材文件。
 */
export function DrawnProp({ name, size }: { name: string; size?: number }) {
  if (name === 'blanket') return <Blanket size={size ?? 150} />
  if (name === 'basin') return <WaterBasin size={size ?? 130} />
  if (name === 'table') return <Table size={size ?? 160} />
  if (name === 'blocks') return <Blocks size={size ?? 130} />
  return null
}

/* ── 贴纸 ───────────────────────────────────────────────
 * 每完成一个故事，孩子在"冒险地图"上贴一张。这是产品的记忆点（设计文档 §7），
 * 所以八张都单独画，不做成同一个模板换个图标。
 */

export type StickerId =
  | 'picnic'
  | 'raincoat'
  | 'ball'
  | 'breakfast'
  | 'toybox'
  | 'puppy'
  | 'shopping'
  | 'zoo'

function StickerFrame({ children, tilt }: { children: React.ReactNode; tilt: number }) {
  return (
    <g transform={`rotate(${tilt} 60 60)`}>
      {/* 手撕纸边：故意画成不规则多边形 */}
      <path
        d="M12 26 L30 10 L58 16 L84 8 L104 24 L112 52 L104 82 L86 106 L56 112 L28 104 L10 82 L6 52 Z"
        fill="#fbf7ec"
        stroke="#2e2a26"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {children}
    </g>
  )
}

export function Sticker({ id, size = 120, className = '' }: ShapeProps & { id: StickerId }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label="故事贴纸">
      {id === 'picnic' && (
        <StickerFrame tilt={-5}>
          {/* 篮子 + 一片草地 */}
          <path d="M26 92 Q60 84 94 92" fill="none" stroke="#4f8f55" strokeWidth="5" strokeLinecap="round" />
          <path d="M34 56 Q60 48 86 56 L80 88 Q60 94 40 88 Z" fill="#c98c4e" stroke="#2e2a26" strokeWidth="3" strokeLinejoin="round" />
          <path d="M38 66 Q60 60 82 66 M40 76 Q60 71 80 76" fill="none" stroke="#a86e38" strokeWidth="3" />
          <path d="M40 56 Q60 24 80 56" fill="none" stroke="#2e2a26" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="48" cy="50" r="8" fill="#dc5b3c" stroke="#2e2a26" strokeWidth="2.5" />
          <path d="M66 44 q12 4 10 14" fill="none" stroke="#e9a13b" strokeWidth="6" strokeLinecap="round" />
        </StickerFrame>
      )}

      {id === 'raincoat' && (
        <StickerFrame tilt={6}>
          {/* 雨衣 + 雨滴 */}
          <path d="M40 42 L52 34 Q60 42 68 34 L80 42 L86 88 Q60 95 34 88 Z" fill="#e9a13b" stroke="#2e2a26" strokeWidth="3" strokeLinejoin="round" />
          <path d="M60 42 L60 88" fill="none" stroke="#2e2a26" strokeWidth="2.5" />
          <path d="M52 34 Q60 26 68 34" fill="none" stroke="#2e2a26" strokeWidth="3" />
          <g fill="#235a79">
            <path d="M30 22 q5 8 0 11 q-5 -3 0 -11" />
            <path d="M90 30 q5 8 0 11 q-5 -3 0 -11" />
            <path d="M24 58 q5 8 0 11 q-5 -3 0 -11" />
          </g>
        </StickerFrame>
      )}

      {id === 'ball' && (
        <StickerFrame tilt={-8}>
          {/* 球 + 它滚过的轨迹 */}
          <path d="M18 88 Q34 60 52 78 Q68 94 92 62" fill="none" stroke="#235a79" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 7" />
          <circle cx="60" cy="52" r="24" fill="#dc5b3c" stroke="#2e2a26" strokeWidth="3" />
          <path d="M38 46 Q60 58 82 46" fill="none" stroke="#fbf7ec" strokeWidth="5" strokeLinecap="round" />
          <path d="M42 62 Q60 70 78 62" fill="none" stroke="#fbf7ec" strokeWidth="4" strokeLinecap="round" />
          <circle cx="92" cy="62" r="5" fill="#e9a13b" stroke="#2e2a26" strokeWidth="2.5" />
        </StickerFrame>
      )}

      {id === 'breakfast' && (
        <StickerFrame tilt={4}>
          {/* 一份摆好的早餐：盘子 + 煎蛋 + 立着的吐司，热气从蛋上直接升起来 */}
          <g stroke="#c98c4e" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.75">
            <path d="M44 44 q-7 -11 1 -21 M58 40 q-7 -12 1 -22" />
          </g>
          <ellipse cx="60" cy="84" rx="42" ry="19" fill="#fbf7ec" stroke="#2e2a26" strokeWidth="3.2" />
          <ellipse cx="60" cy="79" rx="31" ry="12" fill="none" stroke="#d8cdb2" strokeWidth="2.5" />
          {/* 煎蛋摊在盘子左半边 */}
          <path d="M30 76 q-8 -15 7 -19 q7 -13 21 -6 q16 -4 16 11 q9 11 -6 16 q-20 8 -38 -2 Z" fill="#fdfaf2" stroke="#2e2a26" strokeWidth="2.8" strokeLinejoin="round" />
          <circle cx="51" cy="71" r="8.5" fill="#e9a13b" stroke="#2e2a26" strokeWidth="2.4" />
          {/* 吐司立在盘子右后方：带方肩和圆顶，一眼是面包片而不是方块 */}
          <path d="M79 74 L79 52 q0 -9 9 -9 q3 -7 9 -2 q6 3 2 9 l0 24 q-10 4 -20 0 Z" fill="#e8b96a" stroke="#2e2a26" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M83 60 q7 -3 13 0" fill="none" stroke="#c98c4e" strokeWidth="2.4" strokeLinecap="round" />
        </StickerFrame>
      )}

      {id === 'toybox' && (
        <StickerFrame tilt={-6}>
          {/* 收拾好的玩具箱：盖子从后沿向上翻开，玩具从箱口冒出来 */}
          {/* 箱身先画，箱口是一道敞开的椭圆——别让盖子看着像浮在半空 */}
          <path d="M24 64 L30 100 Q60 110 90 100 L96 64 Z" fill="#c98c4e" stroke="#2e2a26" strokeWidth="3.2" strokeLinejoin="round" />
          <ellipse cx="60" cy="64" rx="36" ry="11" fill="#8e5f2f" stroke="#2e2a26" strokeWidth="3.2" />
          <path d="M60 76 L60 106" fill="none" stroke="#a86e38" strokeWidth="2.5" />
          {/* 掀开的盖子：铰在箱子后沿，向左后方斜倒 */}
          <path d="M26 62 L14 30 L52 22 L64 54 Z" fill="#d9c49a" stroke="#2e2a26" strokeWidth="3.2" strokeLinejoin="round" />
          {/* 从箱口冒出来的积木与小熊 */}
          <rect x="38" y="42" width="20" height="18" rx="2.5" fill="#dc5b3c" stroke="#2e2a26" strokeWidth="2.8" transform="rotate(-10 48 51)" />
          <rect x="62" y="44" width="17" height="16" rx="2.5" fill="#5b8fa8" stroke="#2e2a26" strokeWidth="2.8" transform="rotate(12 70 52)" />
          {/* 探出箱口的小熊头：两只耳朵才读得出是小熊，不是又一个球 */}
          <circle cx="88" cy="46" r="12" fill="#e8b96a" stroke="#2e2a26" strokeWidth="2.8" />
          <circle cx="80" cy="35" r="5" fill="#c98c4e" stroke="#2e2a26" strokeWidth="2.4" />
          <circle cx="97" cy="37" r="5" fill="#c98c4e" stroke="#2e2a26" strokeWidth="2.4" />
          <circle cx="84" cy="45" r="1.9" fill="#2e2a26" />
          <circle cx="92" cy="45" r="1.9" fill="#2e2a26" />
          <ellipse cx="88" cy="51" rx="3" ry="2.3" fill="#2e2a26" />
        </StickerFrame>
      )}

      {id === 'puppy' && (
        <StickerFrame tilt={7}>
          {/* 澡盆里的小狗：一头泡泡，尾巴还在外面甩 */}
          <g fill="#eaf4f8" stroke="#7fb8d0" strokeWidth="2.4">
            <circle cx="34" cy="36" r="7" />
            <circle cx="88" cy="32" r="5.5" />
            <circle cx="72" cy="22" r="4.5" />
          </g>
          <path d="M20 60 Q60 51 100 60 L93 96 Q60 108 27 96 Z" fill="#cfe0e7" stroke="#2e2a26" strokeWidth="3.2" strokeLinejoin="round" />
          {/* 盆沿那圈泡沫 */}
          <g fill="#fbf7ec" stroke="#2e2a26" strokeWidth="2.4">
            <circle cx="28" cy="60" r="8" />
            <circle cx="46" cy="56" r="9" />
            <circle cx="66" cy="56" r="8" />
            <circle cx="86" cy="60" r="8" />
          </g>
          {/* 狗头从泡沫里探出来 */}
          <ellipse cx="58" cy="40" rx="17" ry="14" fill="#e8b96a" stroke="#2e2a26" strokeWidth="3" />
          <path d="M44 33 q-9 -10 -3 -17 q10 3 13 11 Z" fill="#c98c4e" stroke="#2e2a26" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M72 33 q9 -10 3 -17 q-10 3 -13 11 Z" fill="#c98c4e" stroke="#2e2a26" strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="52" cy="39" r="2.4" fill="#2e2a26" />
          <circle cx="64" cy="39" r="2.4" fill="#2e2a26" />
          <ellipse cx="58" cy="46" rx="3.8" ry="2.9" fill="#2e2a26" />
          {/* 甩在盆外的尾巴 */}
          <path d="M95 78 q14 -7 12 -21" fill="none" stroke="#e8b96a" strokeWidth="7" strokeLinecap="round" />
          <path d="M95 78 q14 -7 12 -21" fill="none" stroke="#2e2a26" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
        </StickerFrame>
      )}

      {id === 'shopping' && (
        <StickerFrame tilt={-6}>
          {/* 装满的购物车：斜着的车斗 + 露出车沿的果蔬 */}
          <path d="M14 34 L26 34 L36 76 L92 76" fill="none" stroke="#2e2a26" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 44 L98 44 L90 70 L34 70 Z" fill="#5b8fa8" stroke="#2e2a26" strokeWidth="3.4" strokeLinejoin="round" />
          {/* 车斗的网格 */}
          <g stroke="#2e2a26" strokeWidth="2" opacity="0.55">
            <path d="M44 44 L41 70 M60 44 L58 70 M76 44 L75 70 M32 56 L94 56" />
          </g>
          {/* 露出来的果蔬 */}
          <circle cx="44" cy="37" r="10" fill="#dc5b3c" stroke="#2e2a26" strokeWidth="2.8" />
          <path d="M44 27 q4 -6 9 -4" fill="none" stroke="#4f8f55" strokeWidth="3" strokeLinecap="round" />
          <circle cx="66" cy="34" r="9" fill="#e9a13b" stroke="#2e2a26" strokeWidth="2.8" />
          <path d="M84 40 q-3 -14 5 -20 q7 6 3 20 Z" fill="#6fae6a" stroke="#2e2a26" strokeWidth="2.6" strokeLinejoin="round" />
          {/* 轮子 */}
          <circle cx="46" cy="88" r="8" fill="#fbf7ec" stroke="#2e2a26" strokeWidth="3.2" />
          <circle cx="84" cy="88" r="8" fill="#fbf7ec" stroke="#2e2a26" strokeWidth="3.2" />
        </StickerFrame>
      )}

      {id === 'zoo' && (
        <StickerFrame tilt={5}>
          {/* 长颈鹿从栅栏后探出头——脖子最有辨识度，一眼是动物园不是农场 */}
          <path d="M18 96 Q60 90 102 96" fill="none" stroke="#589a57" strokeWidth="6" strokeLinecap="round" />
          {/* 栅栏 */}
          <g fill="#c98c4e" stroke="#2e2a26" strokeWidth="2.8" strokeLinejoin="round">
            <path d="M20 70 l6 -8 l6 8 l0 24 l-12 0 Z" />
            <path d="M38 71 l6 -8 l6 8 l0 23 l-12 0 Z" />
            <path d="M56 69 l6 -8 l6 8 l0 25 l-12 0 Z" />
            <path d="M74 71 l6 -8 l6 8 l0 23 l-12 0 Z" />
            <path d="M92 70 l6 -8 l6 8 l0 24 l-12 0 Z" />
          </g>
          <path d="M16 76 Q60 72 104 78" fill="none" stroke="#a86e38" strokeWidth="5" strokeLinecap="round" />
          {/* 长颈鹿 */}
          <path d="M62 72 Q58 48 60 30" fill="none" stroke="#e9a13b" strokeWidth="13" strokeLinecap="round" />
          <g fill="#c98c4e">
            <circle cx="60" cy="40" r="4" />
            <circle cx="61" cy="54" r="4" />
            <circle cx="59" cy="66" r="3.6" />
          </g>
          <ellipse cx="66" cy="26" rx="15" ry="11" fill="#e9a13b" stroke="#2e2a26" strokeWidth="2.8" transform="rotate(-12 66 26)" />
          <path d="M56 18 q-8 -4 -10 -11 q9 0 13 7 Z" fill="#e9a13b" stroke="#2e2a26" strokeWidth="2.4" strokeLinejoin="round" />
          {/* 头顶两只小角 */}
          <path d="M62 16 l-1 -8 M70 16 l2 -8" stroke="#2e2a26" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="61" cy="9" r="2.6" fill="#c98c4e" stroke="#2e2a26" strokeWidth="2" />
          <circle cx="72" cy="9" r="2.6" fill="#c98c4e" stroke="#2e2a26" strokeWidth="2" />
          <circle cx="64" cy="23" r="2.2" fill="#2e2a26" />
          <ellipse cx="77" cy="28" rx="4" ry="3" fill="#c98c4e" stroke="#2e2a26" strokeWidth="2" />
        </StickerFrame>
      )}
    </svg>
  )
}

/** 麦克风图标。孩子端唯一的"功能"图形，所以画得比 UI 图标更像一个物件。 */
export function MicIcon({ size = 54, className = '' }: ShapeProps) {
  return (
    <svg viewBox="0 0 48 60" width={size} height={(size * 60) / 48} className={className} aria-hidden="true">
      <rect x="16" y="5" width="16" height="28" rx="8" fill="currentColor" stroke="#2e2a26" strokeWidth="3" />
      <path d="M9 27 Q9 43 24 43 Q39 43 39 27" fill="none" stroke="#2e2a26" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 43 L24 53" fill="none" stroke="#2e2a26" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 53 L34 53" fill="none" stroke="#2e2a26" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/** 重听图标：一个绕回去的箭头，配合喇叭。 */
export function ReplayIcon({ size = 44, className = '' }: ShapeProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
      <path d="M10 22 L18 14 L18 34 Z" fill="currentColor" stroke="#2e2a26" strokeWidth="3" strokeLinejoin="round" />
      <path d="M24 16 Q33 24 24 32" fill="none" stroke="#2e2a26" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M31 10 Q45 24 31 38" fill="none" stroke="#2e2a26" strokeWidth="3.6" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}
