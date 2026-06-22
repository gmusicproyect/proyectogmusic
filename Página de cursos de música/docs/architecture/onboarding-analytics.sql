-- Gmusic — onboarding_analytics
-- Decisión: D-PROD-01
-- Fecha: 2026-06-22
-- Propósito: telemetría del quiz de temperamento pre-demo

CREATE TYPE temperament_type AS ENUM (
  'sanguine',
  'choleric',
  'melancholic',
  'phlegmatic'
);

CREATE TABLE onboarding_analytics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            TEXT NOT NULL,
  user_id               UUID NULL REFERENCES "User"(id) ON DELETE SET NULL,

  -- Resultado
  calculated_temperament  temperament_type NOT NULL,
  scores                JSONB NOT NULL,
  -- Ejemplo scores: {"sanguine":2,"choleric":1,"melancholic":2,"phlegmatic":1}
  is_tie                BOOLEAN NOT NULL DEFAULT FALSE,

  -- Telemetría global
  total_duration_ms     INTEGER NOT NULL,
  total_answer_changes  INTEGER NOT NULL DEFAULT 0,
  questions_answered    SMALLINT NOT NULL DEFAULT 6,

  -- Detalle por pregunta
  -- Ejemplo: [{"question_id":1,"option":"a","temperament":"sanguine","time_ms":4200,"answer_changes":0}, ...]
  question_events       JSONB NOT NULL,

  -- Contexto funnel
  instrument_slug       TEXT NULL,
  referrer_path         TEXT NULL,

  completed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_onboarding_analytics_session
  ON onboarding_analytics (session_id);

CREATE INDEX idx_onboarding_analytics_user
  ON onboarding_analytics (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX idx_onboarding_analytics_temperament
  ON onboarding_analytics (calculated_temperament);

CREATE INDEX idx_onboarding_analytics_completed_at
  ON onboarding_analytics (completed_at DESC);

COMMENT ON TABLE onboarding_analytics IS
  'Quiz de temperamento pre-demo (D-PROD-01). Segmentación conductual; no personalización inmediata.';
