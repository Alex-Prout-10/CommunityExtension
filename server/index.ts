import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, FindingType } from '../src/generated/prisma/client.js'
import { z } from 'zod'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and add your Postgres connection string.')
}
if (databaseUrl.startsWith('prisma+')) {
  throw new Error('DATABASE_URL must be a direct postgresql:// connection for this API, not a Prisma Accelerate URL.')
}

const port = Number(process.env.PORT ?? 3000)
const configuredOrigins = new Set(
  (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
const app = express()

app.use(cors({
  origin(origin, callback) {
    // Chrome extensions send their chrome-extension:// origin. Local Vite development is also allowed.
    const allowed = !origin
      || origin === 'http://localhost:5173'
      || configuredOrigins.has(origin)
      || (process.env.NODE_ENV !== 'production' && origin.startsWith('chrome-extension://'))
    callback(allowed ? null : new Error('Origin is not allowed by CORS'))
  },
}))
app.use(express.json({ limit: '20kb' }))

const sessionIdSchema = z.object({ sessionId: z.string().uuid() })

const quizAttemptSchema = sessionIdSchema.extend({
  questionId: z.string().uuid(),
  selectedAnswer: z.number().int().min(0).max(20),
})

const scanSchema = sessionIdSchema.extend({
  // This should be an origin such as https://example.com, not a full browsing URL.
  pageOrigin: z.string().url().max(2_048).transform((value) => new URL(value).origin),
  riskScore: z.number().int().min(0).max(100),
  pageCategory: z.enum(['shopping', 'social', 'news', 'video', 'education', 'forum', 'general']),
  findings: z.array(z.object({
    type: z.nativeEnum(FindingType),
    severity: z.number().int().min(1).max(5),
    detail: z.string().trim().min(1).max(500).optional(),
  })).max(50),
})

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T | undefined {
  const parsed = schema.safeParse(body)
  return parsed.success ? parsed.data : undefined
}

app.get('/health', async (_request, response) => {
  await prisma.$queryRaw`SELECT 1`
  response.json({ status: 'ok' })
})

app.post('/api/sessions', async (_request, response) => {
  const session = await prisma.session.create({ data: {} })
  response.status(201).json({ sessionId: session.id })
})

app.get('/api/categories', async (_request, response) => {
  const categories = await prisma.category.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, slug: true, title: true, description: true },
  })
  response.json(categories)
})

app.get('/api/categories/:slug/questions', async (request, response) => {
  const category = await prisma.category.findUnique({
    where: { slug: request.params.slug },
    select: {
      questions: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          prompt: true,
          options: { orderBy: { position: 'asc' }, select: { id: true, position: true, text: true } },
        },
      },
    },
  })
  if (!category) return response.status(404).json({ error: 'Quiz category not found.' })
  response.json(category.questions)
})

app.post('/api/quiz-attempts', async (request, response) => {
  const input = parseBody(quizAttemptSchema, request.body)
  if (!input) return response.status(400).json({ error: 'Invalid quiz-attempt payload.' })

  const [session, question] = await Promise.all([
    prisma.session.findUnique({ where: { id: input.sessionId }, select: { id: true } }),
    prisma.question.findUnique({
      where: { id: input.questionId },
      include: { category: { select: { title: true } }, options: { orderBy: { position: 'asc' } } },
    }),
  ])
  if (!session) return response.status(404).json({ error: 'Session not found.' })
  if (!question) return response.status(404).json({ error: 'Question not found.' })

  const selectedOption = question.options.find((option) => option.position === input.selectedAnswer)
  const correctOption = question.options.find((option) => option.isCorrect)
  if (!selectedOption || !correctOption) return response.status(400).json({ error: 'Invalid answer choice.' })

  const wasCorrect = selectedOption.id === correctOption.id
  const attempt = await prisma.quizAttempt.create({
    data: {
      sessionId: session.id,
      questionId: question.id,
      category: question.category.title,
      questionText: question.prompt,
      selectedAnswer: selectedOption.position,
      correctAnswer: correctOption.position,
      wasCorrect,
    },
  })
  response.status(201).json({ id: attempt.id, wasCorrect, explanation: selectedOption.explanation })
})

app.post('/api/scans', async (request, response) => {
  const input = parseBody(scanSchema, request.body)
  if (!input) return response.status(400).json({ error: 'Invalid scan payload.' })

  const sessionExists = await prisma.session.findUnique({ where: { id: input.sessionId }, select: { id: true } })
  if (!sessionExists) return response.status(404).json({ error: 'Session not found.' })

  const scan = await prisma.scan.create({
    data: {
      sessionId: input.sessionId,
      pageOrigin: input.pageOrigin,
      riskScore: input.riskScore,
      pageCategory: input.pageCategory,
      findings: { create: input.findings },
    },
  })
  response.status(201).json({ id: scan.id })
})

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  void _next
  console.error(error)
  response.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(port, () => console.log(`Safe Scan API listening on http://localhost:${port}`))
