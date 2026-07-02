-- CreateEnum
CREATE TYPE "CommunityLevel" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "CommunityPostType" AS ENUM ('question', 'progress', 'music', 'feedback', 'collaboration', 'admin_featured');

-- CreateEnum
CREATE TYPE "ExternalLinkProvider" AS ENUM ('drive', 'youtube', 'soundcloud', 'spotify', 'facebook', 'other');

-- CreateTable
CREATE TABLE "community_enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "academic_tier_id" TEXT NOT NULL,
    "program_label" TEXT NOT NULL,
    "current_lesson_number" INTEGER,
    "current_lesson_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_type" "CommunityPostType" NOT NULL,
    "level" "CommunityLevel" NOT NULL,
    "instrument" TEXT NOT NULL,
    "lesson_number" INTEGER,
    "content" TEXT NOT NULL,
    "topic_label" TEXT,
    "external_url" TEXT,
    "external_provider" "ExternalLinkProvider",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_enrollments_user_id_key" ON "community_enrollments"("user_id");

-- CreateIndex
CREATE INDEX "community_posts_level_created_at_idx" ON "community_posts"("level", "created_at" DESC);

-- CreateIndex
CREATE INDEX "community_posts_user_id_idx" ON "community_posts"("user_id");

-- AddForeignKey
ALTER TABLE "community_enrollments" ADD CONSTRAINT "community_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
