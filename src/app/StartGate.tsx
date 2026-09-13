import { useMemo, useState } from 'react'

import { Bear } from '../components/Bear'
import { MicIcon } from '../components/HandDrawn'
import { isRecognitionSupported } from '../speech/recognition'
import { isSynthesisSupported, unlockSpeech } from '../speech/synthesis'
import './StartGate.css'

/**
 * 开场闸门。存在的理由有三个，都来自设计文档 §8.3：
 *
 *   1. iOS / Safari 的语音合成必须由用户手势解锁，否则全程静音
 *   2. 首次使用要处理麦克风权限说明——而且要在孩子看到弹窗之前，让大人先读到
 *   3. 浏览器兼容性边界要讲清楚，而不是让人对着一个不出声的界面猜
 *
 * 这一屏是给**大人**看的，所以有文字。按下之后孩子端就再也没有文字了。
 */

export function StartGate({ onStart }: { onStart: () => void }) {
  const [asking, setAsking] = useState(false)
  const support = useMemo(
    () => ({ mic: isRecognitionSupported(), tts: isSynthesisSupported() }),
    [],
  )

  const start = async () => {
    setAsking(true)
    unlockSpeech()
    try {
      // 主动求一次麦克风权限，让系统弹窗出现在这一屏、而不是故事进行到一半时
      await navigator.mediaDevices?.getUserMedia({ audio: true }).then((s) => s.getTracks().forEach((t) => t.stop()))
    } catch {
      // 拒绝也照常进入：故事会自动切成点选模式（设计文档 §8.3）
    }
    onStart()
  }

  return (
    <div className="gate">
      <div className="gate__bear">
        <Bear mood="happy" action="wave" size={190} />
      </div>

      <h1 className="gate__title">小熊英语小屋</h1>
      <p className="gate__sub">听懂故事，帮小熊解决问题，然后说给他听。</p>

      <ul className="gate__notes">
        {/* 每个 li 是两列 grid，所以正文必须裹在**一个**元素里——
            直接放裸文本 + <strong>，strong 会变成第三个 grid item 被拆到下一行 */}
        <li>
          <span className="gate__icon" aria-hidden="true">
            <MicIcon size={22} />
          </span>
          <span>
            接下来会请求<strong>麦克风权限</strong>。孩子的话只在本机识别，不上传、不保存录音。
          </span>
        </li>
        <li>
          <span className="gate__icon" aria-hidden="true">🔊</span>
          <span>请把音量打开，并戴好耳机或在安静的房间里玩 —— 环境噪音会明显影响识别。</span>
        </li>
        <li>
          <span className="gate__icon" aria-hidden="true">👦</span>
          <span>没有分数、没有红叉。说不出来时小熊会示范，点一下画面故事就继续。</span>
        </li>
      </ul>

      {!support.mic && (
        <p className="gate__warn">
          这个浏览器不支持语音识别。故事仍然可以完整玩完 —— 孩子用点选代替开口。
          想用麦克风，请在电脑或安卓上换 <strong>Chrome / Edge</strong>。
        </p>
      )}
      {!support.tts && (
        <p className="gate__warn">这个浏览器不支持语音合成，小熊将不会发声。建议换 Chrome / Edge。</p>
      )}

      <button type="button" className="gate__start" onClick={start} disabled={asking}>
        {asking ? '正在准备…' : '开始'}
      </button>

      <p className="gate__foot">长按首页右上角的小人图标可以打开家长端。</p>
    </div>
  )
}
