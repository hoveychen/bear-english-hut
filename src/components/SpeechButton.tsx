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
          onClick={listening ? onStop : usable ? onStart : onSkip}
          disabled={busy}
          aria-label={listening ? '我说完了' : usable ? '按住说话' : '继续故事'}
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
