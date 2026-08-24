-- CreateEnum
CREATE TYPE "StudyMethod" AS ENUM ('VIDEOS', 'LECTURA', 'PRACTICA', 'MIXTO');

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN "preferredStudyMethod" "StudyMethod" NOT NULL DEFAULT 'MIXTO';

-- CreateTable
CREATE TABLE "recommended_videos" (
    "id" UUID NOT NULL,
    "knowledgeTopicId" UUID NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommended_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recommended_videos_knowledgeTopicId_youtubeVideoId_key" ON "recommended_videos"("knowledgeTopicId", "youtubeVideoId");

-- CreateIndex
CREATE INDEX "recommended_videos_knowledgeTopicId_idx" ON "recommended_videos"("knowledgeTopicId");

-- AddForeignKey
ALTER TABLE "recommended_videos" ADD CONSTRAINT "recommended_videos_knowledgeTopicId_fkey" FOREIGN KEY ("knowledgeTopicId") REFERENCES "knowledge_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS, misma convención que el resto de las tablas de usuario (ver
-- migración 20260823120000): defensa en profundidad, no protege las
-- queries de Prisma hoy (ese rol tiene BYPASSRLS), pero cierra el hueco si
-- algún día se lee vía cliente con el JWT de sesión.
ALTER TABLE "recommended_videos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recommended_videos" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_topic" ON "recommended_videos"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "knowledge_topics" kt JOIN "subjects" s ON s."id" = kt."subjectId"
    JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE kt."id" = "recommended_videos"."knowledgeTopicId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "knowledge_topics" kt JOIN "subjects" s ON s."id" = kt."subjectId"
    JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE kt."id" = "recommended_videos"."knowledgeTopicId" AND sp."userId" = auth.uid()
  ));
