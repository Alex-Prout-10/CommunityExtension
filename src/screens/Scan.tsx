import { useState } from 'react'
import type { PageScan } from '../lib/pageScan'

type ScanProps = { scan: PageScan | null; isScanning: boolean; error: string | null; scanAgain: () => void; takeQuiz: (length: number) => void; quizMenu: () => void; openExpanded: () => void }

const lessons: Record<string, { title: string; nextStep: string }> = {
  'evaluate-sources': { title: 'Check the Source', nextStep: 'Look for author, date, evidence, and independent coverage.' },
  'suspicious-links': { title: 'Spot Scams & Manipulation', nextStep: 'Pause before opening links or sharing credentials.' },
  'understand-ads-persuasion': { title: 'Understand Ads & Persuasion', nextStep: 'Notice what action the content wants you to take.' },
  'protect-privacy': { title: 'Protect Privacy', nextStep: 'Share only necessary information.' },
  'ai-media-verification': { title: 'Verify AI & Media', nextStep: 'Check the source and context behind a media claim.' },
  'participate-respectfully': { title: 'Participate Respectfully', nextStep: 'Consider accuracy, fairness, and impact.' },
  'social-media-safety': { title: 'Social Media Safety', nextStep: 'Check the audience and protect personal details.' },
}

function riskLabel(score: number) { return score === 0 ? { label: 'No urgent signals found', tone: 'calm' } : score < 15 ? { label: 'Quick verification suggested', tone: 'caution' } : score < 40 ? { label: 'Use caution before acting', tone: 'caution' } : { label: 'Pause and verify', tone: 'warning' } }
function findingLabel(type: PageScan['findings'][number]['type']) {
  const labels: Partial<Record<PageScan['findings'][number]['type'], string>> = { EXTERNAL_LINK_SIGNAL: 'External links', PRIVACY_CONCERN: 'Privacy', SOCIAL_MEDIA_CONCERN: 'Social safety', AD_PERSUASION_SIGNAL: 'Ads & persuasion', SOURCE_CONTEXT_SIGNAL: 'Source context', AI_MEDIA_SIGNAL: 'AI media' }
  return labels[type] ?? type.replaceAll('_', ' ').toLowerCase()
}
function formatDate(value: string | undefined) { if (!value) return 'Not detected'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString() }
function expandedRiskMessage(category: PageScan['category']) {
  const messages: Record<PageScan['category']['kind'], string> = {
    shopping: 'Before buying, compare the seller, price, return policy, and payment method.',
    social: 'Before posting or replying, check the audience, protect personal details, and pause before sharing.',
    news: 'Before believing or sharing a claim, check who made it, when it was published, and what evidence supports it.',
    video: 'Before sharing media, check its original source, date, location, and whether reliable sources confirm it.',
    education: 'Use the page as a starting point, then check its author, evidence, and links to original information.',
    forum: 'Treat discussion as a starting point; verify claims independently and participate with care and respect.',
    general: 'Pause before sharing information, opening unfamiliar links, or giving personal details to a website.',
  }
  return messages[category.kind]
}

export default function ScanScreen({ scan, isScanning, error, scanAgain, takeQuiz, quizMenu, openExpanded }: ScanProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)
  const [questionCount, setQuestionCount] = useState(3)
  const risk = riskLabel(scan?.riskScore ?? 0)
  const recommendedSlug = scan?.findings.find((finding) => finding.riskPoints > 0)?.lessonSlug ?? scan?.category.lessonSlug ?? 'evaluate-sources'
  const recommended = lessons[recommendedSlug] ?? lessons['evaluate-sources']
  const groups = scan ? [...scan.findings.reduce((all, finding) => { const label = findingLabel(finding.type); all.set(label, (all.get(label) ?? 0) + 1); return all }, new Map<string, number>()).entries()] : []
  return <div className="screen scan-screen">
    {isScanning && <div className="loading-card"><span className="spinner" /> MILE-oh is checking this page…</div>}
    {error && <div className="error-card"><strong>Couldn’t scan this page.</strong><span>{error}</span><button className="secondary-button" onClick={scanAgain}>Try again</button></div>}
    {scan && !isScanning && <>
      <section className="mascot-guide"><img src="/MILE-oh_lightmode.jpg" alt="MILE-oh flamingo" /><div><p className="eyebrow">MILE-oh says</p><strong>{scan.category.label}</strong><p>{scan.category.reason}</p></div></section>
      <section className={`score-card ${risk.tone}`}><div className="score-ring"><strong>{scan.riskScore}</strong><span>/ 100</span></div><div><p className="score-label">{risk.label}</p><p className="muted truncate score-short">MILE score · {scan.title}</p><p className="muted score-expanded">{expandedRiskMessage(scan.category)}</p></div></section>
      <div className="top-actions"><div className="quiz-quick-start"><button className="primary-button" onClick={() => takeQuiz(questionCount)}><span className="quiz-button-short">Take quiz</span><span className="quiz-button-full">Take quiz: {recommended.title}</span></button><label className="question-length"><span>{questionCount}</span><input aria-label="Number of quiz questions" type="range" min="1" max="10" value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} /></label></div><button className="text-button small-text-button" onClick={openExpanded}>Open side view</button></div>
      <div className="stats-row"><span>{scan.linkCount} links checked</span><span>{scan.imageCount} images reviewed</span></div>
      <section className="findings-card compact-findings"><div className="section-heading"><h3>What MILE-oh noticed</h3>{scan.findings.length > 0 && <button className="text-button small-text-button" onClick={() => setDetailsOpen(!detailsOpen)}>{detailsOpen ? 'Hide details' : 'See details'}</button>}</div>{scan.findings.length === 0 ? <p className="muted">Nothing urgent stood out. Keep using your careful-check habits.</p> : <div className="finding-chips">{groups.map(([label, count]) => <span key={label}>{label}{count > 1 ? ` · ${count}` : ''}</span>)}</div>}{detailsOpen && <ul className="finding-list">{scan.findings.map((finding) => <li key={`${finding.type}-${finding.detail}`}><span className="finding-dot" /><div><span className="finding-type">{findingLabel(finding.type)}</span><p>{finding.detail}</p></div></li>)}</ul>}</section>
      <section className="source-card"><div className="section-heading"><div><p className="eyebrow">SOURCE & CONTEXT</p><strong>Source details</strong></div><button className="text-button small-text-button" onClick={() => setSourceOpen(!sourceOpen)}>{sourceOpen ? 'Hide details' : 'See details'}</button></div>{sourceOpen && <><div className="context-grid"><p><span>Provider</span>{scan.sourceContext.provider}</p><p><span>Author</span>{scan.sourceContext.author ?? 'Not detected'}</p><p><span>Published</span>{formatDate(scan.sourceContext.publishedDate)}</p><p><span>External links</span>{scan.sourceContext.externalLinkCount}</p></div>{scan.sourceContext.aboutUrl && <a className="about-link" href={scan.sourceContext.aboutUrl} target="_blank" rel="noreferrer">Open About / Contact page ↗</a>}<p className="source-note">Missing details are a cue to investigate, not proof a source is unreliable.</p></>}</section>
      <button className="secondary-button full-width" onClick={scanAgain}>Scan again</button><div className="action-row"><button className="text-button" onClick={quizMenu}>All quizzes</button></div>
    </>}
  </div>
}
