import type { QuizCategory } from '../lib/quiz'

type QuizMenuProps = {
  backToScan: () => void
  categories: QuizCategory[]
  recommendedSlug: string | null
  loading: boolean
  error: string | null
  selectCategory: (slug: string) => void
}

export default function QuizMenuScreen({ backToScan, categories, recommendedSlug, loading, error, selectCategory }: QuizMenuProps) {
  return (
    <div className="screen quiz-menu-screen">
      <header className="compact-header"><p className="eyebrow">MILE-oh PRACTICE</p><h2>Choose a learning path</h2></header>
      {loading && <div className="loading-card"><span className="spinner" /> Loading MILE-oh lessons…</div>}
      {error && <div className="error-card"><strong>Lessons couldn’t load.</strong><span>{error}</span></div>}
      {!loading && !error && <div className="category-list">
        {categories.map((category) => <button className={`category-card ${category.slug === recommendedSlug ? 'recommended' : ''}`} key={category.id} onClick={() => selectCategory(category.slug)}>
          {category.slug === recommendedSlug && <span className="recommendation">RECOMMENDED FOR THIS SCAN</span>}
          <strong>{category.title}</strong><span>{category.description}</span><b>Start lesson →</b>
        </button>)}
      </div>}
      <button className="text-button" onClick={backToScan}>← Back to scan</button>
    </div>
  )
}
