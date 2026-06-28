CREATE TYPE "AuthRateLimitAction" AS ENUM ('LOGIN', 'SIGNUP');

CREATE TABLE "AuthRateLimitBucket" (
    "id" TEXT NOT NULL,
    "action" "AuthRateLimitAction" NOT NULL,
    "subjectHash" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthRateLimitBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthRateLimitBucket_action_subjectHash_windowStart_key" ON "AuthRateLimitBucket"("action", "subjectHash", "windowStart");
CREATE INDEX "AuthRateLimitBucket_windowStart_idx" ON "AuthRateLimitBucket"("windowStart");
