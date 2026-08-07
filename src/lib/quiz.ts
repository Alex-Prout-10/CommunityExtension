export type QuizCategory = {
  id: string
  slug: string
  title: string
  description: string
}

export type QuizQuestion = {
  id: string
  prompt: string
  options: Array<{ id: string; position: number; text: string }>
}

export type QuizAnswerResult = {
  wasCorrect: boolean
  explanation: string
}
