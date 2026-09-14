/**
 * 麦克风按钮的按压时序，单独拎出来的一小台状态机。
 *
 * 抽离的理由不是"为了好测"，是它本来就不属于渲染：一颗按钮要同时接住两种
 * 习惯——按住说话（松手即停）和点一下说话（再点一下停）——而这两者只能靠
 * **按压时长**区分。这段判断和 React 没有任何关系，混在组件里反而看不清。
 *
 * 为什么要接住两种：五岁孩子十有八九会像点别的按钮一样，啪地点一下就松手，
 * 那样录音窗口只有几十毫秒，什么都录不到，她会以为自己说了而机器没听见。
 */

/** 调用方该做的事。`none` = 什么都别做。 */
export type PressAction = 'start' | 'stop' | 'none'

export type PressToTalk = {
  /** 按下（或键盘按键按下）。`listening` 是此刻是否正在收听。 */
  down(listening: boolean): PressAction
  /** 松开（或键盘按键抬起）。 */
  up(): PressAction
  /** 一轮收听结束后复位，下一问重新从"按住"开始。 */
  reset(): void
  /** 当前是否处在"再点一下才停"的模式——只用来决定按钮的无障碍标签。 */
  isTapMode(): boolean
}

export type PressOptions = {
  /** 短于这个时长的按压算"点一下"，默认 500ms */
  tapMs?: number
  /** 取当前时间，测试里可替换 */
  now?: () => number
}

export function createPressToTalk(opts: PressOptions = {}): PressToTalk {
  const { tapMs = 500, now = () => Date.now() } = opts

  let holding = false
  let pressedAt = 0
  let tapMode = false

  return {
    down(listening) {
      if (listening) {
        // 已经在"点开点关"模式里听着了：这一下就是那个"再点一下"。
        // 若不是这个模式（说明手指还按在上面），忽略——重复的 down 不该停掉录音。
        if (!tapMode) return 'none'
        tapMode = false
        return 'stop'
      }
      holding = true
      pressedAt = now()
      return 'start'
    },

    up() {
      if (!holding) return 'none'
      holding = false
      if (now() - pressedAt < tapMs) {
        // 按得太短：留着继续听，等她说完再点一下（或安静到超时）
        tapMode = true
        return 'none'
      }
      return 'stop'
    },

    reset() {
      holding = false
      tapMode = false
    },

    isTapMode() {
      return tapMode
    },
  }
}
