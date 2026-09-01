-- CreateEnum
CREATE TYPE "StudyDropMediaType" AS ENUM ('VIDEO', 'IMAGEN');

-- CreateTable
CREATE TABLE "study_drops" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "subjectId" UUID,
    "caption" TEXT,
    "mediaType" "StudyDropMediaType" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "fileSizeKb" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_drops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_drop_likes" (
    "id" UUID NOT NULL,
    "studyDropId" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_drop_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_drops_studentProfileId_createdAt_idx" ON "study_drops"("studentProfileId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "study_drop_likes_studyDropId_studentProfileId_key" ON "study_drop_likes"("studyDropId", "studentProfileId");

-- CreateIndex
CREATE INDEX "study_drop_likes_studyDropId_idx" ON "study_drop_likes"("studyDropId");

-- AddForeignKey
ALTER TABLE "study_drops" ADD CONSTRAINT "study_drops_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_drops" ADD CONSTRAINT "study_drops_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_drop_likes" ADD CONSTRAINT "study_drop_likes_studyDropId_fkey" FOREIGN KEY ("studyDropId") REFERENCES "study_drops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_drop_likes" ADD CONSTRAINT "study_drop_likes_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Row Level Security — mismo criterio de "higiene, no la barrera real hoy"
-- documentado en la migración rate_limit_and_rls (la app usa el rol admin
-- de Supabase, que tiene BYPASSRLS). El filtro real de visibilidad
-- amigos/grupo vive en studyDropService.getFeed.
--
-- A diferencia de toda política previa en el repo (todas "own_via_*",
-- dueño exclusivo), study_drops es la primera tabla visible a alguien
-- más que el dueño: cualquier amigo aceptado o compañero de algún grupo
-- en común.
-- ---------------------------------------------------------------------------

ALTER TABLE "study_drops" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_drops" FORCE ROW LEVEL SECURITY;

CREATE POLICY "visible_to_owner_friends_and_group" ON "study_drops"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_drops"."studentProfileId" AND sp."userId" = auth.uid())
    OR EXISTS (
      SELECT 1 FROM "friendships" f
      JOIN "student_profiles" viewer ON viewer."userId" = auth.uid()
      WHERE f."status" = 'ACCEPTED'
        AND ((f."requesterId" = "study_drops"."studentProfileId" AND f."addresseeId" = viewer."id")
          OR (f."addresseeId" = "study_drops"."studentProfileId" AND f."requesterId" = viewer."id"))
    )
    OR EXISTS (
      SELECT 1 FROM "study_group_members" author_m
      JOIN "study_group_members" viewer_m ON viewer_m."studyGroupId" = author_m."studyGroupId"
      JOIN "student_profiles" viewer ON viewer."id" = viewer_m."studentProfileId"
      WHERE author_m."studentProfileId" = "study_drops"."studentProfileId" AND viewer."userId" = auth.uid()
    )
  );

CREATE POLICY "post_as_self" ON "study_drops"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_drops"."studentProfileId" AND sp."userId" = auth.uid())
  );

CREATE POLICY "owner_deletes" ON "study_drops"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_drops"."studentProfileId" AND sp."userId" = auth.uid())
  );

ALTER TABLE "study_drop_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_drop_likes" FORCE ROW LEVEL SECURITY;

-- Visible a quien pueda ver el drop al que pertenece: la subconsulta contra
-- study_drops queda sujeta a la RLS de esa misma tabla para el rol actual,
-- así que esto hereda automáticamente el criterio de arriba sin duplicarlo.
CREATE POLICY "visible_with_drop" ON "study_drop_likes"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "study_drops" d WHERE d."id" = "study_drop_likes"."studyDropId")
  );

CREATE POLICY "like_as_self" ON "study_drop_likes"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_drop_likes"."studentProfileId" AND sp."userId" = auth.uid())
  );

CREATE POLICY "unlike_self" ON "study_drop_likes"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_drop_likes"."studentProfileId" AND sp."userId" = auth.uid())
  );
