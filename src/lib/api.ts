const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const sessionStorageKey = 'safeScanSessionId'
import type { PageScan } from './pageScan'
import type { QuizAnswerResult, QuizCategory, QuizQuestion } from './quiz'

type QuizAttempt = {
  questionId: string
  selectedAnswer: number
}

function extensionStorageGet(key: string): Promise<Record<string, unknown>> {
  return chrome.storage.local.get<Record<string, unknown>>([key])
}

function extensionStorageSet(values: Record<string, unknown>): Promise<void> {
  return chrome.storage.local.set<Record<string, unknown>>(values)
}

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response
}

async function getSessionId() {
  const stored = await extensionStorageGet(sessionStorageKey)
  const existingId = stored[sessionStorageKey]
  if (typeof existingId === 'string') return existingId

  const response = await request('/api/sessions', { method: 'POST' })
  const { sessionId } = await response.json() as { sessionId: string }
  await extensionStorageSet({ [sessionStorageKey]: sessionId })
  return sessionId
}

export async function recordQuizAttempt(attempt: QuizAttempt) {
  const sessionId = await getSessionId()
  const response = await request('/api/quiz-attempts', {
    method: 'POST',
    body: JSON.stringify({ sessionId, ...attempt }),
  })
  return response.json() as Promise<QuizAnswerResult>
}

export async function recordScan(scan: PageScan) {
  const sessionId = await getSessionId()
  await request('/api/scans', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      pageOrigin: scan.pageOrigin,
      riskScore: scan.riskScore,
      pageCategory: scan.category.kind,
      findings: scan.findings,
    }),
  })
}

export async function getQuizCategories() {
  const response = await request('/api/categories')
  return response.json() as Promise<QuizCategory[]>
}

export async function getQuizQuestions(slug: string) {
  const response = await request(`/api/categories/${encodeURIComponent(slug)}/questions`)
  return response.json() as Promise<QuizQuestion[]>
}
