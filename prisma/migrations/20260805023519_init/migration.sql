-- CreateEnum
CREATE TYPE "FindingType" AS ENUM ('SUSPICIOUS_LINK', 'AI_MEDIA_SIGNAL', 'MISINFORMATION_SIGNAL', 'OTHER');

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "questionText" TEXT NOT NULL,
    "selectedAnswer" INTEGER NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "pageOrigin" VARCHAR(2048) NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyFinding" (
    "id" UUID NOT NULL,
    "scanId" UUID NOT NULL,
    "type" "FindingType" NOT NULL,
    "severity" INTEGER NOT NULL,
    "detail" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizAttempt_sessionId_createdAt_idx" ON "QuizAttempt"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "Scan_sessionId_createdAt_idx" ON "Scan"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SafetyFinding_scanId_idx" ON "SafetyFinding"("scanId");

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyFinding" ADD CONSTRAINT "SafetyFinding_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
