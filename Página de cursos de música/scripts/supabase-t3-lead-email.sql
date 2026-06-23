-- T3: vincular email del gate con session_id del quiz (onboarding_analytics)
-- Ejecutar en Supabase SQL Editor si prisma migrate deploy no está disponible.

ALTER TABLE "onboarding_analytics" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "onboarding_analytics" ADD COLUMN IF NOT EXISTS "lead_captured_at" TIMESTAMPTZ;
ALTER TABLE "onboarding_analytics" ADD COLUMN IF NOT EXISTS "selected_plan_id" TEXT;

CREATE INDEX IF NOT EXISTS "onboarding_analytics_email_idx"
  ON "onboarding_analytics"("email")
  WHERE "email" IS NOT NULL;

-- Verificación T3:
-- SELECT email, calculated_temperament, session_id, lead_captured_at
-- FROM onboarding_analytics
-- WHERE email IS NOT NULL
-- ORDER BY lead_captured_at DESC;
