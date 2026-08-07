import type { QuizQuestion } from '../lib/quiz'

type QuizQProps = {
  backToScan: () => void
  submitAnswer: () => void
  question: QuizQuestion
  userAnswer: number
  setAnswer: React.Dispatch<React.SetStateAction<number>>
  questionIndex: number
  totalQuestions: number
  category: string
  submitting: boolean
}

export default function QuizQScreen({ backToScan, submitAnswer, question, userAnswer, setAnswer, questionIndex, totalQuestions, category, submitting }: QuizQProps) {
  return (
    <div className="screen quiz-question-screen">
      <header className="quiz-header"><button className="text-button" onClick={backToScan}>← Scan</button><span>{questionIndex + 1} / {totalQuestions}</span></header>
      <div className="oh-question-intro"><img src="/MILE-oh_lightmode.jpg" alt="Oh the flamingo" /><div><p className="eyebrow">OH ASKS · {category}</p><strong>Let’s imagine this together…</strong></div></div><h2>{question.prompt}</h2>
      <div className="answer-options">{question.options.map((option) => <label className={`answer-option ${userAnswer === option.position ? 'selected' : ''}`} key={option.id}>
        <input type="radio" name="choice" checked={userAnswer === option.position} onChange={() => setAnswer(option.position)} />
        <span>{option.text}</span>
      </label>)}</div>
      <button className="primary-button full-width" disabled={userAnswer === -1 || submitting} onClick={submitAnswer}>{submitting ? 'Checking…' : 'Check my answer'}</button>
    </div>
  )
}
