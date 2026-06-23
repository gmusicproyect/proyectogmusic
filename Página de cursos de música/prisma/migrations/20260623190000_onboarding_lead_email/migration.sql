-- AlterTable onboarding_analytics — T3 lead capture (session_id ↔ email)
ALTER TABLE "onboarding_analytics" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "onboarding_analytics" ADD COLUMN IF NOT EXISTS "lead_captured_at" TIMESTAMPTZ;
ALTER TABLE "onboarding_analytics" ADD COLUMN IF NOT EXISTS "selected_plan_id" TEXT;

CREATE INDEX IF NOT EXISTS "onboarding_analytics_email_idx"
  ON "onboarding_analytics"("email")
  WHERE "email" IS NOT NULL;
