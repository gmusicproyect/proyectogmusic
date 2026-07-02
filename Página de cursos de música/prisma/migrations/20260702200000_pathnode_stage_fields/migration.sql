-- D-GOV-04 / R-008: campos de materia por etapa (PathNode) + StageType

CREATE TYPE "StageType" AS ENUM (
  'FUNDAMENTO_UNO',
  'FUNDAMENTO_DOS',
  'TECNICA',
  'PRACTICA',
  'TOCAR'
);

ALTER TABLE "PathNode"
  ADD COLUMN "stageType" "StageType",
  ADD COLUMN "videoUrl" TEXT,
  ADD COLUMN "guideText" TEXT,
  ADD COLUMN "completionCriteria" TEXT,
  ADD COLUMN "ctaLabel" TEXT;
