import { useMemo, useState } from 'react'

import { scenes } from '../content'
import { buildSceneReport, reportAsText, SKILL_LABEL, type SceneReport } from '../state/report'
import { resetProgress } from '../state/progress'
import './ParentReport.css'

/**
 * 家长端（设计文档 §10）。
 *
 * 这一面**用文字**——它是写给大人看的。孩子端的无文字规约到这里为止。
 *
 * 报告里没有分数、没有正确率、没有和别人的对比。七项观察对应设计文档 §13 的
 * 第一版验证指标，所以家长看到的进展和团队要验证的是同一件事。
 */

function ObservationRow({ label, state, stateText, detail }: SceneReport['observations'][number]) {
  return (
    <li className={`pr__obs pr__obs--${state}`}>
      <span className="pr__obsMark" aria-hidden="true">
        {state === 'yes' ? (
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M4 13 L10 19 L20 5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : state === 'partial' ? (
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M4 12 L20 12" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="3 3" />
          </svg>
        )}
      </span>
      <span className="pr__obsLabel">{label}</span>
      <span className="pr__obsState">{stateText}</span>
      <span className="pr__obsDetail">{detail}</span>
    </li>
  )
}

function ReportCard({ report }: { report: SceneReport }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportAsText(report))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="pr__card">
      <header className="pr__cardHead">
        <h3>{report.sceneTitle}</h3>
        <time>
          {report.finishedAt
            ? new Date(report.finishedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '进行中'}
        </time>
      </header>

      <p className="pr__summary">
        本次完成：{report.completedSkills.map((s) => SKILL_LABEL[s]).join('、') || '—'}
      </p>

      <dl className="pr__counts">
        <div>
          <dt>独立表达</dt>
          <dd>{report.independent} 次</dd>
        </div>
        <div>
          <dt>借助句首完成</dt>
          <dd>{report.withStarter} 次</dd>
        </div>
        <div>
          <dt>听完整示范后继续</dt>
          <dd>{report.withFullModel} 次</dd>
        </div>
        <div>
          <dt>最长一次连说</dt>
          <dd>{report.longestUtterance} 个英文词</dd>
        </div>
      </dl>

      <ul className="pr__obsList">
        {report.observations.map((o) => (
          <ObservationRow {...o} key={o.key} />
        ))}
      </ul>

      <footer className="pr__cardFoot">
        <p className="pr__practice">
          <strong>建议家庭复听</strong>
          <span>{report.practice.join(' / ') || '—'}</span>
        </p>
        <button type="button" className="pr__copy" onClick={copy}>
          {copied ? '已复制' : '复制这份报告'}
        </button>
      </footer>
    </article>
  )
}

export function ParentReport({ onExit }: { onExit: () => void }) {
  // 每次进入重新读一遍 localStorage，别缓存——孩子可能刚玩完一局
  const reports = useMemo(() => scenes.map((s) => buildSceneReport(s.id)).filter((r): r is SceneReport => r !== null), [])
  const [cleared, setCleared] = useState(false)

  return (
    <div className="pr">
      <header className="pr__top">
        <button type="button" className="pr__back" onClick={onExit}>
          ← 返回
        </button>
        <h2>学习记录</h2>
      </header>

      <p className="pr__intro">
        这里记录的是<strong>语言任务</strong>，不是发音分数，也没有正确率。
        我们关心的是：她愿不愿意开口、听不听得懂任务、能不能从关键词说到完整句，
        以及同一个表达能否在下一个故事里再用出来。
      </p>

      {reports.length === 0 || cleared ? (
        <p className="pr__empty">还没有记录。陪她讲完一个故事，这里就会出现第一份报告。</p>
      ) : (
        <div className="pr__cards">
          {reports.map((r) => (
            <ReportCard key={r.sceneId} report={r} />
          ))}
        </div>
      )}

      <section className="pr__family">
        <h3>在家里怎么接着用</h3>
        <p>
          家庭端以<strong>听力输入</strong>为主，不布置书面作业。每周挑一两句在真实生活里说一次就够了 ——
          出门前看看天：<em>I need my umbrella because it is raining.</em>
          洗水果时：<em>First we wash the apple, then we eat it.</em>
        </p>
      </section>

      {!cleared && reports.length > 0 && (
        <button
          type="button"
          className="pr__reset"
          onClick={() => {
            if (window.confirm('清空全部学习记录和已收集的贴纸？这一步不能撤销。')) {
              resetProgress()
              setCleared(true)
            }
          }}
        >
          清空学习记录
        </button>
      )}
    </div>
  )
}
