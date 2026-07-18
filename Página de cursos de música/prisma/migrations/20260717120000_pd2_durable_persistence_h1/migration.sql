-- PD-2 Persistencia Durable H1
-- Eventos append-only, proyecciones de progreso/contexto, catálogo Biblioteca
-- y snapshot de contenido por sesión (R-001).
-- Entorno: local/Docker únicamente. Prod bloqueado (R-OPS-01). Sin seed aquí.

-- CreateEnum
CREATE TYPE "PracticeEventType" AS ENUM ('practice_started', 'practice_completed', 'practice_abandoned', 'ftc_card_completed', 'unit_completed');

-- CreateEnum
CREATE TYPE "LibraryResourceType" AS ENUM ('song_simple', 'exercise', 'video_guide', 'backing_track', 'support_material');

-- CreateEnum
CREATE TYPE "ResourceAccessTier" AS ENUM ('basic', 'premium');

-- AlterTable (R-001 snapshot de contenido por sesión)
ALTER TABLE "LessonSession" ADD COLUMN     "content_snapshot" JSONB,
ADD COLUMN     "content_version" INTEGER;

-- CreateTable
CREATE TABLE "practice_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" "PracticeEventType" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "session_id" TEXT,
    "tarjeta_id" TEXT,
    "unidad_id" TEXT,
    "month_index" INTEGER,
    "slot" INTEGER,
    "payload" JSONB NOT NULL,
    "causation_command_id" TEXT,
    "natural_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ftc_progress_projections" (
    "user_id" TEXT NOT NULL,
    "completed_card_ids" JSONB NOT NULL,
    "completed_unit_ids" JSONB NOT NULL,
    "slots_by_unit" JSONB NOT NULL,
    "rebuilt_at" TIMESTAMP(3) NOT NULL,
    "rebuild_source" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ftc_progress_projections_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "learner_projections_h1" (
    "user_id" TEXT NOT NULL,
    "onboarding_status" TEXT NOT NULL,
    "partial_answers" JSONB,
    "result" JSONB,
    "learning_goal_override" TEXT,
    "weekly_goal_minutes_override" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_projections_h1_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "library_resources" (
    "id" TEXT NOT NULL,
    "title_internal" TEXT NOT NULL,
    "title_public" TEXT,
    "instrument" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "suggested_month" INTEGER,
    "skill_key" TEXT,
    "type" "LibraryResourceType" NOT NULL,
    "estimated_minutes" INTEGER NOT NULL,
    "access_tier" "ResourceAccessTier" NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "media_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_resource_links" (
    "id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "tarjeta_id" TEXT,
    "unidad_id" TEXT,
    "month_index" INTEGER,

    CONSTRAINT "library_resource_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "practice_events_natural_key_key" ON "practice_events"("natural_key");

-- CreateIndex
CREATE INDEX "practice_events_user_id_occurred_at_idx" ON "practice_events"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "practice_events_session_id_idx" ON "practice_events"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_events_user_id_event_type_causation_command_id_key" ON "practice_events"("user_id", "event_type", "causation_command_id");

-- CreateIndex
CREATE INDEX "library_resources_status_instrument_suggested_month_idx" ON "library_resources"("status", "instrument", "suggested_month");

-- CreateIndex
CREATE INDEX "library_resource_links_resource_id_idx" ON "library_resource_links"("resource_id");

-- AddForeignKey
ALTER TABLE "practice_events" ADD CONSTRAINT "practice_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ftc_progress_projections" ADD CONSTRAINT "ftc_progress_projections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_projections_h1" ADD CONSTRAINT "learner_projections_h1_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_resource_links" ADD CONSTRAINT "library_resource_links_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "library_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
