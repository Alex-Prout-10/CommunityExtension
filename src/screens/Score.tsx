type ScoreProps = { retryQuiz: () => void; backToScan: () => void; totalCorrect: number; totalQuestions: number; category: string }

export default function ScoreScreen({ retryQuiz, backToScan, totalCorrect, totalQuestions, category }: ScoreProps) {
  return <div className="screen score-screen"><div className="result-icon correct">★</div><p className="eyebrow">LESSON COMPLETE</p><h2>{category}</h2><p className="score-summary">{totalCorrect} / {totalQuestions} correct</p><p className="explanation">Every careful check makes your next click more informed.</p><button className="primary-button full-width" onClick={retryQuiz}>Practice again</button><button className="text-button" onClick={backToScan}>Back to scan</button></div>
}
