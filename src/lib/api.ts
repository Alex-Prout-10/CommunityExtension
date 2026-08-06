const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const sessionStorageKey = 'safeScanSessionId'

type QuizAttempt = {
  category: string
  questionText: string
  selectedAnswer: number
  correctAnswer: number
  wasCorrect: boolean
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
  await request('/api/quiz-attempts', {
    method: 'POST',
    body: JSON.stringify({ sessionId, ...attempt }),
  })
}
