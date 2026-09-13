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
 * 按内容层的 `drawn:<name>` 取到对应的手绘道具。
 *
 * 舞台和图片顺序卡都要用它——顺序卡最初只认图片文件 URL，结果"先洗苹果"
 * 那张卡是空的，因为水盆根本没有素材文件。
 */
export function DrawnProp({ name, size }: { name: string; size?: number }) {
  if (name === 'blanket') return <Blanket size={size ?? 150} />
  if (name === 'basin') return <WaterBasin size={size ?? 130} />
  if (name === 'table') return <Table size={size ?? 160} />
  return null
}

/* ── 贴纸 ───────────────────────────────────────────────
 * 每完成一个故事，孩子在"冒险地图"上贴一张。这是产品的记忆点（设计文档 §7），
 * 所以三张都单独画，不做成同一个模板换个图标。
 */

export type StickerId = 'picnic' | 'raincoat' | 'ball'

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
