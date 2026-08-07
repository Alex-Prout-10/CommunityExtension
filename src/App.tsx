import { useState } from 'react'
import './App.css'
import HomeScreen from './screens/Home'
import ScanScreen from './screens/Scan'
import QuizQScreen from './screens/Quiz_Q'
import QuizAScreen from './screens/Quiz_A'
import ScoreScreen from './screens/Score'
import QuizMenuScreen from './screens/Quiz_Menu'
import { getQuizCategories, getQuizQuestions, recordQuizAttempt, recordScan } from './lib/api'
import type { PageScan } from './lib/pageScan'
import type { QuizAnswerResult, QuizCategory, QuizQuestion } from './lib/quiz'

type Screen = 'home' | 'scan' | 'quiz_q' | 'quiz_a' | 'score' | 'quiz_menu'

function randomQuiz(questions: QuizQuestion[], length: number) {
  return [...questions].sort(() => Math.random() - 0.5).slice(0, length)
}

function getActiveTabScan(): Promise<PageScan> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return reject(new Error('No active tab was found.'))
      chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE' }, (response: PageScan | undefined) => {
        if (chrome.runtime.lastError) {
          const chromeMessage = chrome.runtime.lastError.message ?? 'Unknown Chrome messaging error.'
          console.warn('MILE-oh could not reach the page scanner:', chromeMessage)
          if (chromeMessage.includes('Receiving end does not exist')) return reject(new Error('Reload MILE-oh in chrome://extensions, then refresh this webpage before scanning.'))
          if (chromeMessage.includes('Cannot access contents of url')) return reject(new Error('Chrome does not allow extensions to scan this type of page. Try a regular website instead.'))
          return reject(new Error(`Chrome could not connect MILE-oh to this page: ${chromeMessage}`))
        }
        if (!response) return reject(new Error('MILE-oh did not receive a scan result.'))
        resolve(response)
      })
    })
  })
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [scan, setScan] = useState<PageScan | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [categories, setCategories] = useState<QuizCategory[]>([])
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [quizCategory, setQuizCategory] = useState<QuizCategory | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState(-1)
  const [quizResult, setQuizResult] = useState<QuizAnswerResult | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [quizLength, setQuizLength] = useState(3)

  const recommendedSlug = () => {
    const strongest = scan?.findings.reduce((best, finding) => finding.riskPoints > best.riskPoints ? finding : best)
    return strongest?.lessonSlug ?? 'evaluate-sources'
  }

  async function initScanScreen() {
    setScreen('scan'); setIsScanning(true); setScanError(null)
    try { const result = await getActiveTabScan(); setScan(result); void recordScan(result).catch((error: unknown) => console.warn('Could not save scan:', error)) }
    catch (error) { setScan(null); setScanError(error instanceof Error ? error.message : 'Please try again.') }
    finally { setIsScanning(false) }
  }

  async function openQuizMenu() {
    setScreen('quiz_menu')
    if (categories.length) return
    setQuizLoading(true); setQuizError(null)
    try { setCategories(await getQuizCategories()) }
    catch (error) { setQuizError(error instanceof Error ? error.message : 'Please start the API server and try again.') }
    finally { setQuizLoading(false) }
  }

  async function openExpandedView() {
    const currentWindow = await chrome.windows.getCurrent()
    if (currentWindow.id !== undefined) await chrome.sidePanel.open({ windowId: currentWindow.id })
  }

  async function startQuiz(slug: string, length = 3) {
    setScreen('quiz_menu'); setQuizLoading(true); setQuizError(null)
    try {
      let availableCategories = categories
      if (!availableCategories.length) {
        availableCategories = await getQuizCategories()
        setCategories(availableCategories)
      }
      const questions = await getQuizQuestions(slug)
      if (questions.length < length) throw new Error(`This lesson needs at least ${length} questions before it can start.`)
      const category = availableCategories.find((item) => item.slug === slug)
      if (!category) throw new Error('Quiz category could not be found.')
      setQuizCategory(category); setQuizLength(length); setQuiz(randomQuiz(questions, length)); setCurrentQuestionIndex(0); setUserAnswer(-1); setQuizResult(null); setTotalScore(0); setScreen('quiz_q')
    } catch (error) { setQuizError(error instanceof Error ? error.message : 'Could not start this lesson.') }
    finally { setQuizLoading(false) }
  }

  async function submitAnswer() {
    const question = quiz[currentQuestionIndex]
    if (!question || userAnswer === -1) return
    setSubmittingAnswer(true)
    try { setQuizResult(await recordQuizAttempt({ questionId: question.id, selectedAnswer: userAnswer })); setScreen('quiz_a') }
    catch (error) { setQuizError(error instanceof Error ? error.message : 'Your answer could not be checked.'); setScreen('quiz_menu') }
    finally { setSubmittingAnswer(false) }
  }

  function nextQuestion() {
    if (quizResult?.wasCorrect) setTotalScore((score) => score + 1)
    if (currentQuestionIndex >= quiz.length - 1) { setScreen('score'); return }
    setCurrentQuestionIndex((index) => index + 1); setUserAnswer(-1); setQuizResult(null); setScreen('quiz_q')
  }

  if (screen === 'home') return <HomeScreen initScan={() => void initScanScreen()} />
  if (screen === 'scan') return <ScanScreen scan={scan} isScanning={isScanning} error={scanError} scanAgain={() => void initScanScreen()} takeQuiz={(length) => void startQuiz(recommendedSlug(), length)} quizMenu={() => void openQuizMenu()} openExpanded={() => void openExpandedView()} />
  if (screen === 'quiz_menu') return <QuizMenuScreen backToScan={() => void initScanScreen()} categories={categories} recommendedSlug={recommendedSlug()} loading={quizLoading} error={quizError} selectCategory={(slug) => void startQuiz(slug)} />

  const question = quiz[currentQuestionIndex]
  if (screen === 'quiz_q' && question && quizCategory) return <QuizQScreen backToScan={() => void initScanScreen()} submitAnswer={() => void submitAnswer()} question={question} userAnswer={userAnswer} setAnswer={setUserAnswer} questionIndex={currentQuestionIndex} totalQuestions={quiz.length} category={quizCategory.title} submitting={submittingAnswer} />
  if (screen === 'quiz_a' && question && quizResult) return <QuizAScreen retryQuestion={() => { setUserAnswer(-1); setQuizResult(null); setScreen('quiz_q') }} next={nextQuestion} userAnswer={userAnswer} question={question} result={quizResult} />
  if (screen === 'score' && quizCategory) return <ScoreScreen retryQuiz={() => void startQuiz(quizCategory.slug, quizLength)} backToScan={() => void initScanScreen()} totalCorrect={totalScore} totalQuestions={quiz.length} category={quizCategory.title} />
  return <div className="screen error-card">MILE-oh could not load this screen.</div>
}

export default App
