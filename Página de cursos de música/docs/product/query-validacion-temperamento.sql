-- Gmusic — Validación quiz temperamento (D-PROD-01)
-- Ejecutar cuando onboarding_analytics tenga >= 100 registros completos
-- Hipótesis: sanguine dominante en volumen; phlegmatic mejor retención/LTV a 6-12 meses

-- 1. ¿Tenemos muestra suficiente?
SELECT
  COUNT(*) AS total_completados,
  COUNT(*) >= 100 AS listo_para_validar
FROM onboarding_analytics;

-- 2. Distribución por temperamento (hipótesis: sanguine #1 en volumen)
SELECT
  calculated_temperament,
  COUNT(*) AS n,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM onboarding_analytics
GROUP BY calculated_temperament
ORDER BY n DESC;

-- 3. Tiempo promedio por temperamento (sanguíneo = más rápido / más cambios?)
SELECT
  calculated_temperament,
  ROUND(AVG(total_duration_ms) / 1000.0, 1) AS avg_seconds,
  ROUND(AVG(total_answer_changes), 2) AS avg_answer_changes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_duration_ms) AS median_ms
FROM onboarding_analytics
GROUP BY calculated_temperament
ORDER BY avg_seconds;

-- 4. Empates detectados (revisar algoritmo de desempate)
SELECT
  is_tie,
  COUNT(*) AS n
FROM onboarding_analytics
GROUP BY is_tie;

-- 5. Tiempo por pregunta (detectar fricción)
SELECT
  (ev->>'question_id')::int AS question_id,
  ROUND(AVG((ev->>'time_ms')::numeric) / 1000.0, 2) AS avg_seconds,
  ROUND(AVG((ev->>'answer_changes')::numeric), 2) AS avg_changes
FROM onboarding_analytics,
     jsonb_array_elements(question_events) AS ev
GROUP BY (ev->>'question_id')::int
ORDER BY question_id;

-- 6. Retención preliminar por temperamento (requiere join con eventos demo — ajustar cuando exista tabla)
-- Placeholder: usuarios que completaron >= 1 clase demo en 7 días
/*
SELECT
  oa.calculated_temperament,
  COUNT(DISTINCT oa.session_id) AS quiz_completados,
  COUNT(DISTINCT dp.session_id) AS demo_clase_1_en_7d,
  ROUND(
    100.0 * COUNT(DISTINCT dp.session_id) / NULLIF(COUNT(DISTINCT oa.session_id), 0),
    1
  ) AS pct_retencion_clase_1
FROM onboarding_analytics oa
LEFT JOIN demo_progress dp
  ON dp.session_id = oa.session_id
  AND dp.lesson_number >= 1
  AND dp.completed_at <= oa.completed_at + INTERVAL '7 days'
GROUP BY oa.calculated_temperament
ORDER BY pct_retencion_clase_1 DESC;
*/

-- 7. Checklist hipótesis D-PROD-01 (manual)
-- [ ] sanguine es el temperamento con mayor COUNT(*)
-- [ ] phlegmatic muestra mayor retención cuando exista join demo (query 6)
-- [ ] total_completados >= 100
-- [ ] ninguna pregunta con avg_seconds > 45s (fricción UX)
