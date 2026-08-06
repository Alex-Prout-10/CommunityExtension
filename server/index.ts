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
  category: z.string().trim().min(1).max(100),
  questionText: z.string().trim().min(1).max(2_000),
  selectedAnswer: z.number().int().min(0).max(20),
  correctAnswer: z.number().int().min(0).max(20),
  wasCorrect: z.boolean(),
})

const scanSchema = sessionIdSchema.extend({
  // This should be an origin such as https://example.com, not a full browsing URL.
  pageOrigin: z.string().url().max(2_048).transform((value) => new URL(value).origin),
  riskScore: z.number().int().min(0).max(100),
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

app.post('/api/quiz-attempts', async (request, response) => {
  const input = parseBody(quizAttemptSchema, request.body)
  if (!input) return response.status(400).json({ error: 'Invalid quiz-attempt payload.' })

  const sessionExists = await prisma.session.findUnique({ where: { id: input.sessionId }, select: { id: true } })
  if (!sessionExists) return response.status(404).json({ error: 'Session not found.' })

  const attempt = await prisma.quizAttempt.create({ data: input })
  response.status(201).json({ id: attempt.id })
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
