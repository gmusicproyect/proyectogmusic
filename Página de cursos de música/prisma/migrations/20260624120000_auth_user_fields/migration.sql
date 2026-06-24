-- CreateEnum
CREATE TYPE "AccountTier" AS ENUM ('DEMO', 'SUBSCRIBER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accountTier" "AccountTier" NOT NULL DEFAULT 'DEMO';
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- Existing seeded subscribers keep subscriber tier when they have active subscription context in app logic;
-- mark users with any subscription row as SUBSCRIBER for clarity.
UPDATE "User" u
SET "accountTier" = 'SUBSCRIBER'
WHERE EXISTS (
  SELECT 1 FROM "Subscription" s WHERE s."userId" = u.id
);

-- CreateTable
CREATE TABLE "DemoProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemoProgress_userId_idx" ON "DemoProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DemoProgress_userId_lessonNumber_key" ON "DemoProgress"("userId", "lessonNumber");

-- AddForeignKey
ALTER TABLE "DemoProgress" ADD CONSTRAINT "DemoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
