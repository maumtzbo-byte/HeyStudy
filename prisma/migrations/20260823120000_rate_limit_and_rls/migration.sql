-- RateLimitEvent: límite técnico de solicitudes por minuto, independiente
-- del plan (sección 8.5 del spec).
CREATE TABLE "rate_limit_events" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rate_limit_events_key_createdAt_idx" ON "rate_limit_events"("key", "createdAt");


-- ---------------------------------------------------------------------------
-- Row Level Security — defensa en profundidad (sección 8.5).
--
-- IMPORTANTE — leer antes de asumir que esto ya protege algo: la app hoy
-- accede a Postgres vía Prisma, conectado con el rol administrador de
-- Supabase (el que trae el pooler, `postgres.<proyecto>`). Ese rol tiene
-- BYPASSRLS, así que estas políticas NO afectan ninguna query que hace la
-- app ahora mismo — la protección real actual sigue siendo el filtro
-- `where: { studentProfileId }` (o equivalente) que ya existe en cada
-- service. Esta migración es corrección de higiene y blindaje a futuro：
-- si algún día se usa el cliente de Supabase con el JWT de sesión del
-- estudiante (lecturas directas desde el cliente, Realtime, etc.), estas
-- políticas sí serán la única barrera y ya estarán en su lugar.
--
-- Convención: `auth.uid()` es el id de auth.users / la tabla `users` de la
-- app (mismo UUID). Cada política sube la cadena de relaciones hasta
-- encontrar el `student_profiles.userId` (o el `userId`/`studentProfileId`
-- directo cuando la tabla ya lo tiene) y lo compara contra `auth.uid()`.
-- ---------------------------------------------------------------------------

-- users ----------------------------------------------------------------
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_row" ON "users"
  FOR ALL USING ("id" = auth.uid()) WITH CHECK ("id" = auth.uid());

-- student_profiles -------------------------------------------------------
ALTER TABLE "student_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_profiles" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_profile" ON "student_profiles"
  FOR ALL USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());

-- subjects -----------------------------------------------------------------
ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subjects" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_profile" ON "subjects"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "subjects"."studentProfileId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "subjects"."studentProfileId" AND sp."userId" = auth.uid()
  ));

-- assignments ----------------------------------------------------------
ALTER TABLE "assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assignments" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_subject" ON "assignments"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "subjects" s JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE s."id" = "assignments"."subjectId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "subjects" s JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE s."id" = "assignments"."subjectId" AND sp."userId" = auth.uid()
  ));

-- exams ------------------------------------------------------------------
ALTER TABLE "exams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exams" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_subject" ON "exams"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "subjects" s JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE s."id" = "exams"."subjectId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "subjects" s JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE s."id" = "exams"."subjectId" AND sp."userId" = auth.uid()
  ));

-- exam_topics --------------------------------------------------------------
ALTER TABLE "exam_topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_topics" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_exam" ON "exam_topics"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "exams" e JOIN "subjects" s ON s."id" = e."subjectId"
    JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE e."id" = "exam_topics"."examId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "exams" e JOIN "subjects" s ON s."id" = e."subjectId"
    JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE e."id" = "exam_topics"."examId" AND sp."userId" = auth.uid()
  ));

-- materials ------------------------------------------------------------
ALTER TABLE "materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "materials" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_subject" ON "materials"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "subjects" s JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE s."id" = "materials"."subjectId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "subjects" s JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE s."id" = "materials"."subjectId" AND sp."userId" = auth.uid()
  ));

-- grades -------------------------------------------------------------------
ALTER TABLE "grades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grades" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_profile" ON "grades"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "grades"."studentProfileId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "grades"."studentProfileId" AND sp."userId" = auth.uid()
  ));

-- knowledge_topics -----------------------------------------------------
ALTER TABLE "knowledge_topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_topics" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_subject" ON "knowledge_topics"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "subjects" s JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE s."id" = "knowledge_topics"."subjectId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "subjects" s JOIN "student_profiles" sp ON sp."id" = s."studentProfileId"
    WHERE s."id" = "knowledge_topics"."subjectId" AND sp."userId" = auth.uid()
  ));

-- knowledge_mastery ----------------------------------------------------
ALTER TABLE "knowledge_mastery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_mastery" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_profile" ON "knowledge_mastery"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "knowledge_mastery"."studentProfileId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "knowledge_mastery"."studentProfileId" AND sp."userId" = auth.uid()
  ));

-- study_sessions -------------------------------------------------------
ALTER TABLE "study_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_sessions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_profile" ON "study_sessions"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "study_sessions"."studentProfileId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "study_sessions"."studentProfileId" AND sp."userId" = auth.uid()
  ));

-- questions --------------------------------------------------------------
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "questions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_session" ON "questions"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "study_sessions" ss JOIN "student_profiles" sp ON sp."id" = ss."studentProfileId"
    WHERE ss."id" = "questions"."studySessionId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "study_sessions" ss JOIN "student_profiles" sp ON sp."id" = ss."studentProfileId"
    WHERE ss."id" = "questions"."studySessionId" AND sp."userId" = auth.uid()
  ));

-- answers ------------------------------------------------------------------
ALTER TABLE "answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "answers" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_question" ON "answers"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "questions" q
    JOIN "study_sessions" ss ON ss."id" = q."studySessionId"
    JOIN "student_profiles" sp ON sp."id" = ss."studentProfileId"
    WHERE q."id" = "answers"."questionId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "questions" q
    JOIN "study_sessions" ss ON ss."id" = q."studySessionId"
    JOIN "student_profiles" sp ON sp."id" = ss."studentProfileId"
    WHERE q."id" = "answers"."questionId" AND sp."userId" = auth.uid()
  ));

-- error_patterns -------------------------------------------------------
ALTER TABLE "error_patterns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "error_patterns" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_profile" ON "error_patterns"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "error_patterns"."studentProfileId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "error_patterns"."studentProfileId" AND sp."userId" = auth.uid()
  ));

-- study_plans ------------------------------------------------------------
ALTER TABLE "study_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_plans" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_profile" ON "study_plans"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "study_plans"."studentProfileId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "study_plans"."studentProfileId" AND sp."userId" = auth.uid()
  ));

-- study_plan_items -----------------------------------------------------
ALTER TABLE "study_plan_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_plan_items" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_plan" ON "study_plan_items"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "study_plans" p JOIN "student_profiles" sp ON sp."id" = p."studentProfileId"
    WHERE p."id" = "study_plan_items"."studyPlanId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "study_plans" p JOIN "student_profiles" sp ON sp."id" = p."studentProfileId"
    WHERE p."id" = "study_plan_items"."studyPlanId" AND sp."userId" = auth.uid()
  ));

-- tutor_conversations ----------------------------------------------------
ALTER TABLE "tutor_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tutor_conversations" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_profile" ON "tutor_conversations"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "tutor_conversations"."studentProfileId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "tutor_conversations"."studentProfileId" AND sp."userId" = auth.uid()
  ));

-- custom_tutors ----------------------------------------------------------
ALTER TABLE "custom_tutors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "custom_tutors" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_profile" ON "custom_tutors"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "custom_tutors"."studentProfileId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "student_profiles" sp
    WHERE sp."id" = "custom_tutors"."studentProfileId" AND sp."userId" = auth.uid()
  ));

-- tutor_chat_messages ----------------------------------------------------
ALTER TABLE "tutor_chat_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tutor_chat_messages" FORCE ROW LEVEL SECURITY;
CREATE POLICY "own_via_conversation" ON "tutor_chat_messages"
  FOR ALL USING (EXISTS (
    SELECT 1 FROM "tutor_conversations" c JOIN "student_profiles" sp ON sp."id" = c."studentProfileId"
    WHERE c."id" = "tutor_chat_messages"."tutorConversationId" AND sp."userId" = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM "tutor_conversations" c JOIN "student_profiles" sp ON sp."id" = c."studentProfileId"
    WHERE c."id" = "tutor_chat_messages"."tutorConversationId" AND sp."userId" = auth.uid()
  ));

-- subscriptions ----------------------------------------------------------
-- Solo lectura para el propio usuario: el plan/los contadores de uso los
-- escribe la lógica de negocio de confianza (Prisma), no el cliente.
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "read_own" ON "subscriptions"
  FOR SELECT USING ("userId" = auth.uid());

-- ai_usage_logs ------------------------------------------------------------
-- Igual: solo lectura, el registro lo hace el backend.
ALTER TABLE "ai_usage_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_usage_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "read_own" ON "ai_usage_logs"
  FOR SELECT USING ("userId" = auth.uid());

-- study_groups -------------------------------------------------------------
-- Visible al dueño y a cualquier miembro; sólo el dueño puede editar/borrar.
ALTER TABLE "study_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_groups" FORCE ROW LEVEL SECURITY;
CREATE POLICY "visible_to_members" ON "study_groups"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_groups"."ownerId" AND sp."userId" = auth.uid())
    OR EXISTS (
      SELECT 1 FROM "study_group_members" m JOIN "student_profiles" sp ON sp."id" = m."studentProfileId"
      WHERE m."studyGroupId" = "study_groups"."id" AND sp."userId" = auth.uid()
    )
  );
CREATE POLICY "owner_writes" ON "study_groups"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_groups"."ownerId" AND sp."userId" = auth.uid())
  );
CREATE POLICY "owner_updates" ON "study_groups"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_groups"."ownerId" AND sp."userId" = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_groups"."ownerId" AND sp."userId" = auth.uid())
  );
CREATE POLICY "owner_deletes" ON "study_groups"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_groups"."ownerId" AND sp."userId" = auth.uid())
  );

-- study_group_members --------------------------------------------------
-- El roster es visible a cualquier miembro del grupo (para el leaderboard);
-- cada quien sólo puede insertar/borrar su propia membresía.
ALTER TABLE "study_group_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_group_members" FORCE ROW LEVEL SECURITY;
CREATE POLICY "visible_to_group" ON "study_group_members"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "study_group_members" me JOIN "student_profiles" sp ON sp."id" = me."studentProfileId"
      WHERE me."studyGroupId" = "study_group_members"."studyGroupId" AND sp."userId" = auth.uid()
    )
  );
CREATE POLICY "join_self" ON "study_group_members"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_group_members"."studentProfileId" AND sp."userId" = auth.uid())
  );
CREATE POLICY "leave_self" ON "study_group_members"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "study_group_members"."studentProfileId" AND sp."userId" = auth.uid())
  );

-- shared_study_plans -----------------------------------------------------
-- Visible a cualquier miembro del grupo con el que se compartió; sólo quien
-- comparte (y es miembro de ese grupo) puede insertar.
ALTER TABLE "shared_study_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shared_study_plans" FORCE ROW LEVEL SECURITY;
CREATE POLICY "visible_to_group" ON "shared_study_plans"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "study_group_members" m JOIN "student_profiles" sp ON sp."id" = m."studentProfileId"
      WHERE m."studyGroupId" = "shared_study_plans"."studyGroupId" AND sp."userId" = auth.uid()
    )
  );
CREATE POLICY "share_as_self" ON "shared_study_plans"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "shared_study_plans"."sharedById" AND sp."userId" = auth.uid())
    AND EXISTS (
      SELECT 1 FROM "study_group_members" m JOIN "student_profiles" sp ON sp."id" = m."studentProfileId"
      WHERE m."studyGroupId" = "shared_study_plans"."studyGroupId" AND sp."userId" = auth.uid()
    )
  );
CREATE POLICY "unshare_own" ON "shared_study_plans"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "shared_study_plans"."sharedById" AND sp."userId" = auth.uid())
  );

-- rate_limit_events ------------------------------------------------------
-- Sin policies: tabla puramente interna. RLS habilitado = negado por
-- default para cualquier rol sin BYPASSRLS; sólo la app (rol elevado) la
-- toca.
ALTER TABLE "rate_limit_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limit_events" FORCE ROW LEVEL SECURITY;
