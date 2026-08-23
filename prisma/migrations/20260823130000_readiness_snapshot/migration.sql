-- CreateTable
CREATE TABLE "readiness_snapshots" (
    "id" UUID NOT NULL,
    "examId" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "readiness_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "readiness_snapshots_examId_key" ON "readiness_snapshots"("examId");

-- AddForeignKey
ALTER TABLE "readiness_snapshots" ADD CONSTRAINT "readiness_snapshots_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS, misma convención que el resto de las tablas de usuario (ver
-- migración 20260823120000): defensa en profundidad, no protege las
-- queries de Prisma hoy (ese rol tiene BYPASSRLS), pero cierra el hueco si
-- algún día se lee vía cliente con el JWT de sesión.
ALTER TABLE "readiness_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "readiness_snapshots" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_exam" ON "readiness_snapshots"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "exams" e JOIN "subjects" s ON s."id" = e."subjectId"
    JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE e."id" = "readiness_snapshots"."examId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "exams" e JOIN "subjects" s ON s."id" = e."subjectId"
    JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE e."id" = "readiness_snapshots"."examId" AND sp."userId" = auth.uid()
  ));
