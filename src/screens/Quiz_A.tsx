import type { QuizAnswerResult, QuizQuestion } from '../lib/quiz'

type QuizAProps = { retryQuestion: () => void; next: () => void; userAnswer: number; question: QuizQuestion; result: QuizAnswerResult }

export default function QuizAScreen({ retryQuestion, next, userAnswer, question, result }: QuizAProps) {
  const selected = question.options.find((option) => option.position === userAnswer)
  return (
    <div className="screen quiz-answer-screen">
      <div className={`result-icon ${result.wasCorrect ? 'correct' : 'incorrect'}`}>{result.wasCorrect ? '✓' : '!'}</div>
      <p className="eyebrow">{result.wasCorrect ? 'NICE WORK' : 'LET’S CHECK THAT'}</p><h2>{result.wasCorrect ? 'Correct!' : 'Not quite'}</h2>
      <p className="selected-answer">You chose: {selected?.text}</p><p className="explanation">{result.explanation}</p>
      {!result.wasCorrect && <button className="secondary-button full-width" onClick={retryQuestion}>Try this question again</button>}
      <button className="primary-button full-width" onClick={next}>{result.wasCorrect ? 'Next question' : 'Continue'}</button>
    </div>
  )
}
