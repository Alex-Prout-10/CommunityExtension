import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl || databaseUrl.startsWith('prisma+')) {
  throw new Error('DATABASE_URL must be a direct postgresql:// or postgres:// connection string.')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })

type SeedQuestion = {
  prompt: string
  explanation: string
  options: Array<{ text: string; explanation: string; isCorrect: boolean }>
}

const unescoMilUrl = 'https://www.unesco.org/mil4teachers/en/introduction'
const catalog: Array<{ slug: string; title: string; description: string; questions: SeedQuestion[] }> = [
  {
    slug: 'evaluate-sources',
    title: 'Evaluate Sources',
    description: 'Practice checking who made information, why it was made, and whether evidence supports it.',
    questions: [
      {
        prompt: 'A surprising claim appears on a site you have never heard of. What is the best first step before sharing it?',
        explanation: 'A strong check considers the source, its purpose, evidence, and whether independent reliable sources confirm the claim.',
        options: [
          { text: 'Share it quickly so friends can decide.', explanation: 'Speed can spread an unverified claim before anyone checks it.', isCorrect: false },
          { text: 'Check who published it, look for evidence, and compare it with independent reliable sources.', explanation: 'Correct. This examines the provider, the content, and corroborating evidence.', isCorrect: true },
          { text: 'Trust it if the headline has many details.', explanation: 'Detailed wording alone does not establish accuracy.', isCorrect: false },
        ],
      },
      {
        prompt: 'Which question best helps you evaluate the purpose of a post?',
        explanation: 'Understanding the intended audience and purpose helps reveal whether content aims to inform, persuade, sell, entertain, or mislead.',
        options: [
          { text: 'What does the creator want the audience to think, feel, or do?', explanation: 'Correct. Purpose and intended audience are central context clues.', isCorrect: true },
          { text: 'Is the post written in my favorite color?', explanation: 'Appearance preferences do not establish purpose or reliability.', isCorrect: false },
          { text: 'Did the post appear first in my feed?', explanation: 'Feed order is controlled by many factors and is not evidence of reliability.', isCorrect: false },
        ],
      },
      {
        prompt: 'Why is it helpful to compare a factual claim with more than one independent source?',
        explanation: 'Independent corroboration can reveal missing context or unsupported claims; many sites repeating one original error are not independent confirmation.',
        options: [
          { text: 'It can provide corroboration and expose missing context.', explanation: 'Correct. Comparison is part of careful evaluation.', isCorrect: true },
          { text: 'It guarantees every source is correct.', explanation: 'No check can guarantee perfection.', isCorrect: false },
          { text: 'It makes the claim automatically popular.', explanation: 'Popularity and accuracy are different things.', isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: 'suspicious-links',
    title: 'Suspicious Links & Manipulation',
    description: 'Recognize pressure tactics and safer ways to verify a link before acting.',
    questions: [
      {
        prompt: 'You receive an urgent message saying your account will close unless you sign in through its link. What is the safest response?',
        explanation: 'Urgency can be a manipulation tactic. Use a trusted path you control instead of the unexpected link.',
        options: [
          { text: 'Open the link and enter your password immediately.', explanation: 'Do not provide credentials through an unexpected message.', isCorrect: false },
          { text: 'Open the service using its known app or address and check your account there.', explanation: 'Correct. This avoids relying on the unverified link.', isCorrect: true },
          { text: 'Forward the link to everyone you know.', explanation: 'Forwarding can spread a harmful or misleading link.', isCorrect: false },
        ],
      },
      {
        prompt: 'What does a padlock or HTTPS in a browser address bar tell you?',
        explanation: 'HTTPS protects the connection to that site. It does not prove that the organization, claim, or offer is trustworthy.',
        options: [
          { text: 'The connection is encrypted, but the site still needs evaluation.', explanation: 'Correct. Encryption and trustworthiness are different checks.', isCorrect: true },
          { text: 'Every claim on the site is true.', explanation: 'HTTPS does not verify the truth of content.', isCorrect: false },
          { text: 'The link cannot be a scam.', explanation: 'A harmful site can also use HTTPS.', isCorrect: false },
        ],
      },
      {
        prompt: 'A link uses a familiar brand name but the domain is slightly misspelled. What should you do?',
        explanation: 'Look carefully at the full domain and use a known official route if you need the service.',
        options: [
          { text: 'Treat it as official because the logo looks familiar.', explanation: 'Logos and names can be copied.', isCorrect: false },
          { text: 'Avoid the link and navigate to the organization through a trusted address or app.', explanation: 'Correct. This reduces the risk from look-alike domains.', isCorrect: true },
          { text: 'Assume the spelling difference is harmless.', explanation: 'Small changes in a domain can be intentional impersonation.', isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: 'ai-media-verification',
    title: 'AI Media & Verification',
    description: 'Use source, context, and corroboration when evaluating potentially synthetic media.',
    questions: [
      {
        prompt: 'Can one visual clue prove that an image was generated by AI?',
        explanation: 'Visual anomalies can be signals worth investigating, but they are not proof. Source, context, provenance, and corroboration matter.',
        options: [
          { text: 'Yes; one unusual detail proves it.', explanation: 'One clue can be caused by editing, compression, or other factors.', isCorrect: false },
          { text: 'No; treat clues as signals and verify the source and context.', explanation: 'Correct. Avoid treating uncertain signals as certainty.', isCorrect: true },
          { text: 'No image can ever be evaluated.', explanation: 'Images can be investigated using multiple forms of evidence.', isCorrect: false },
        ],
      },
      {
        prompt: 'Before sharing a dramatic video of an alleged current event, what is a strong verification step?',
        explanation: 'Find the original source, check when and where it was recorded, and look for reliable independent reporting or verification.',
        options: [
          { text: 'Share it because it has many comments.', explanation: 'Comments and engagement are not verification.', isCorrect: false },
          { text: 'Check its source and context, then seek independent corroboration.', explanation: 'Correct. This is a careful response to uncertain media.', isCorrect: true },
          { text: 'Decide from the thumbnail alone.', explanation: 'A thumbnail lacks the evidence needed for a reliable conclusion.', isCorrect: false },
        ],
      },
      {
        prompt: 'A post labels an image “AI-generated.” What is the best response?',
        explanation: 'A label can be useful context, but it should be considered alongside the creator, platform information, and other evidence.',
        options: [
          { text: 'Accept the label as complete proof without checking anything else.', explanation: 'Labels can be mistaken, incomplete, or misleading.', isCorrect: false },
          { text: 'Use the label as one clue and check the source and context.', explanation: 'Correct. Verification considers multiple pieces of evidence.', isCorrect: true },
          { text: 'Assume all AI-generated media is harmful.', explanation: 'AI media can have legitimate uses; the context and claims need evaluation.', isCorrect: false },
        ],
      },
    ],
  },
]

async function main() {
  for (const categoryData of catalog) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        title: categoryData.title,
        description: categoryData.description,
        sourceUrl: unescoMilUrl,
        questions: {
          deleteMany: {},
          create: categoryData.questions.map((question) => ({
            prompt: question.prompt,
            explanation: question.explanation,
            sourceUrl: unescoMilUrl,
            options: { create: question.options.map((option, position) => ({ ...option, position })) },
          })),
        },
      },
      create: {
        slug: categoryData.slug,
        title: categoryData.title,
        description: categoryData.description,
        sourceUrl: unescoMilUrl,
        questions: {
          create: categoryData.questions.map((question) => ({
            prompt: question.prompt,
            explanation: question.explanation,
            sourceUrl: unescoMilUrl,
            options: { create: question.options.map((option, position) => ({ ...option, position })) },
          })),
        },
      },
    })
  }
  console.log(`Seeded ${catalog.length} media-and-information-literacy categories.`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
