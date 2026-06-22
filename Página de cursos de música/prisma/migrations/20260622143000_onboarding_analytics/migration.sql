-- CreateEnum
CREATE TYPE "TemperamentType" AS ENUM ('sanguine', 'choleric', 'melancholic', 'phlegmatic');

-- CreateTable
CREATE TABLE "onboarding_analytics" (
    "id" UUID NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" UUID,
    "calculated_temperament" "TemperamentType" NOT NULL,
    "scores" JSONB NOT NULL,
    "is_tie" BOOLEAN NOT NULL DEFAULT false,
    "total_duration_ms" INTEGER NOT NULL,
    "total_answer_changes" INTEGER NOT NULL DEFAULT 0,
    "questions_answered" SMALLINT NOT NULL DEFAULT 6,
    "question_events" JSONB NOT NULL,
    "instrument_slug" TEXT,
    "referrer_path" TEXT,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_analytics_session_id_key" ON "onboarding_analytics"("session_id");

-- CreateIndex
CREATE INDEX "onboarding_analytics_calculated_temperament_idx" ON "onboarding_analytics"("calculated_temperament");

-- CreateIndex
CREATE INDEX "onboarding_analytics_completed_at_idx" ON "onboarding_analytics"("completed_at" DESC);

-- AddForeignKey
ALTER TABLE "onboarding_analytics" ADD CONSTRAINT "onboarding_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
