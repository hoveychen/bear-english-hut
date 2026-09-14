import { useRef } from 'react'

import { scenes } from '../content'
import { Bear } from '../components/Bear'
import { AdventureMap } from '../components/AdventureMap'
import { Sticker, type StickerId } from '../components/HandDrawn'
import { artUrl } from '../components/objectArt'
import './HomeScreen.css'

/**
 * 首页：小熊 + 冒险地图 + 三个故事。
 *
 * 孩子端无文字的规约在这里也成立，所以故事封面是**画**，不是标题；
 * 中文标题只作为 aria-label 存在，给读屏和大人。
 */

type Props = {
  earnedStickers: StickerId[]
  justEarned: StickerId | null
  onPickScene: (sceneId: string) => void
  onCeremonyDone: () => void
  onOpenParent: () => void
}

/** 每个故事的封面画：用故事里的三件道具摆一张小画。 */
/*
 * 每个故事封面摆三件道具。注意下面取值时用了 `?? []`——少一条不会报错，
 * 只会安静地渲染成一张全白的卡片，所以**加场景就必须同时加这里**。
 */
const COVER: Record<string, string[]> = {
  picnic: ['basket', 'apple', 'umbrella'],
  clothes: ['coat', 'boots', 'rain'],
  ball: ['ball', 'dog', 'box'],
  // pan 是一大块灰，摆在封面第一位会把整张卡压得发灰；bread 的暖黄撑得起来
  breakfast: ['bread', 'egg', 'milk'],
  // 封面走 artUrl（只认 objects 里的文件），认不了 drawn: 道具，所以积木上不了封面
  toybox: ['box', 'car', 'teddy'],
  puppy: ['dog', 'bathtub', 'soap'],
  shopping: ['cart', 'tomato', 'cheese'],
}

export function HomeScreen({ earnedStickers, justEarned, onPickScene, onCeremonyDone, onOpenParent }: Props) {
  const pressTimer = useRef<number | null>(null)

  /*
   * 家长入口用长按，不用点击。
   *
   * 原因不是防沉迷，是无文字规约：一颗写着"家长"的按钮就是孩子端的文字。
   * 所以它是个无字图标，而 5 岁孩子的操作习惯是点、不是按住——长按这道门
   * 刚好把她挡在外面，又不需要密码框这种更重的东西。
   */
  const startPress = () => {
    pressTimer.current = window.setTimeout(onOpenParent, 1100)
  }
  const cancelPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const ceremony = justEarned !== null

  return (
    <div className="home">
      <header className="home__top">
        <div className="home__bear">
          <Bear mood={ceremony ? 'happy' : 'neutral'} action={ceremony ? 'cheer' : 'wave'} size={128} />
        </div>

        <button
          type="button"
          className="home__parent"
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="家长端（长按打开）"
        >
          <svg viewBox="0 0 36 36" width="22" height="22" aria-hidden="true">
            <circle cx="18" cy="13" r="6" fill="none" stroke="currentColor" strokeWidth="3.2" />
            <path d="M7 30 q11 -9 22 0" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <section className="home__map" aria-label="冒险地图">
        <AdventureMap earned={earnedStickers} justEarned={justEarned} onCeremonyDone={onCeremonyDone} />
      </section>

      <nav className="home__scenes" aria-label="选择故事">
        {scenes.map((scene) => {
          const done = earnedStickers.includes(scene.sticker)
          return (
            <button
              key={scene.id}
              type="button"
              className={`home__scene ${done ? 'is-done' : ''}`}
              onClick={() => onPickScene(scene.id)}
              disabled={ceremony}
              aria-label={scene.title}
              title={scene.title}
            >
              <span className="home__cover">
                {(COVER[scene.id] ?? []).map((art, i) => {
                  const url = artUrl(art)
                  return url ? <img key={art} src={url} alt="" style={{ ['--i' as string]: String(i) }} /> : null
                })}
              </span>
              {/* 讲过的故事，封面角上贴着那张贴纸——不用打勾，贴纸自己会说 */}
              {done && (
                <span className="home__doneMark" aria-hidden="true">
                  <Sticker id={scene.sticker} size={46} />
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
