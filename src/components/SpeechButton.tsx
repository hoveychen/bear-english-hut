import { useRef } from 'react'

import { MicIcon, ReplayIcon } from './HandDrawn'
import type { Phase } from '../state/useBeatMachine'
import './SpeechButton.css'

/**
 * 底部的大麦克风与重播（设计文档 §7 的画面结构）。
 *
 * 按钮**只管录音状态**，不知道故事在问什么，也不判断对错——
 * 判定全在 intentMatcher，故事流程全在 useBeatMachine。
 */

type Props = {
  phase: Phase
  /** 麦克风召唤态：小熊问完了，在等孩子开口 */
  inviting: boolean
  interim: string
  micSupported: boolean
  voiceDisabled: boolean
  onStart: () => void
  onStop: () => void
  onReplay: () => void
  onSkip: () => void
}

export function SpeechButton({
  phase,
  inviting,
  interim,
  micSupported,
  voiceDisabled,
  onStart,
  onStop,
  onReplay,
  onSkip,
}: Props) {
  const listening = phase === 'listening'
  /**
   * 小熊正在说话的所有阶段。这些时候按钮都要禁掉。
   *
   * `fallback` 一度漏在这个名单外，后果是完整示范播放期间跳过键仍可点：
   * 连点就会一遍遍重启那段示范，永远走不到"点一下继续"。
   * 五岁孩子一定会连点按钮——凡是小熊在出声的阶段，都必须在这里列全。
   */
  const busy =
    phase === 'prompt' ||
    phase === 'intro' ||
    phase === 'support' ||
    phase === 'fallback' ||
    phase === 'success' ||
    phase === 'thinking'
  const usable = micSupported && !voiceDisabled

  /*
   * 按住说话，不是点开点关。
   *
   * 这颗按钮以前绑的是 onClick（点一下开始、再点一下结束），可它的标签一直
   * 写着"按住说话"。第一个照着标签做的人立刻就卡住了：按住期间根本没在录音，
   * 松手它才开始录，那时人已经不说了——症状是"说了半天一点反应都没有"。
   *
   * 统一到按住这一边，而不是反过来改标签：对着 5 岁孩子，对讲机式的
   * "按着才录、松手就完"不需要她理解两次点击的含义不同。
   */
  const holding = useRef(false)

  const beginHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!usable || listening) return
    // 捕获指针：手指按住后滑出按钮范围，松手时仍然收得到 pointerup，
    // 否则录音会一直开着，直到 9 秒上限才自己停
    e.currentTarget.setPointerCapture?.(e.pointerId)
    holding.current = true
    onStart()
  }

  const endHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!holding.current) return
    holding.current = false
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    onStop()
  }

  /* 键盘等价：空格/回车按下开始、抬起结束。孩子不用键盘，但读屏用户要用。 */
  const keyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== ' ' && e.key !== 'Enter') return
    e.preventDefault()
    if (e.repeat || !usable || listening) return
    holding.current = true
    onStart()
  }
  const keyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== ' ' && e.key !== 'Enter') return
    if (!holding.current) return
    holding.current = false
    onStop()
  }

  return (
    <div className="mic">
      <button
        type="button"
        className="mic__side"
        onClick={onReplay}
        disabled={listening || phase === 'intro'}
        aria-label="再听一次"
      >
        <ReplayIcon size={34} />
      </button>

      <div className="mic__center">
        {/* 收听中的声波环。孩子需要看见"机器在听我说话"。 */}
        {listening && (
          <>
            <span className="mic__ring" />
            <span className="mic__ring mic__ring--2" />
          </>
        )}

        <button
          type="button"
          className={[
            'mic__button',
            listening ? 'is-listening' : '',
            inviting && !listening ? 'is-inviting' : '',
            busy ? 'is-busy' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onPointerDown={beginHold}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onKeyDown={keyDown}
          onKeyUp={keyUp}
          // 麦克风用不了时降级成纯点选：这时它就是一颗"继续故事"的普通按钮
          onClick={usable ? undefined : onSkip}
          disabled={busy}
          aria-label={listening ? '松开就说完了' : usable ? '按住说话' : '继续故事'}
        >
          <MicIcon size={58} />
        </button>

        {/*
         * 识别中间结果只做成一条随音量起伏的波形，**不显示识别出的英文**。
         * 孩子端无文字是硬规约；而且把识别文本打在屏幕上，等于把"你说错了"
         * 摆在孩子面前——这正是产品要避免的。
         */
        }
        {listening && (
          <div className="mic__wave" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={interim ? 'is-active' : ''} style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="mic__side"
        onClick={onSkip}
        disabled={listening || busy}
        aria-label="跳过这一步"
      >
        {/* 手绘的"下一页"箭头 */}
        <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
          <path d="M10 20 L28 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M21 12 L29 20 L21 28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>
    </div>
  )
}
