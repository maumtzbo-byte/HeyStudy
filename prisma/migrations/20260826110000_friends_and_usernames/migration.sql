-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_username_key" ON "student_profiles"("username");

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateTable
CREATE TABLE "friendships" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "addresseeId" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friendships_requesterId_addresseeId_key" ON "friendships"("requesterId", "addresseeId");

-- CreateIndex
CREATE INDEX "friendships_addresseeId_status_idx" ON "friendships"("addresseeId", "status");

-- CreateIndex
CREATE INDEX "friendships_requesterId_idx" ON "friendships"("requesterId");

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- No puedes mandarte solicitud a ti mismo.
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_no_self" CHECK ("requesterId" <> "addresseeId");


-- ---------------------------------------------------------------------------
-- Row Level Security — mismo criterio de "higiene, no la barrera real hoy"
-- documentado en la migración rate_limit_and_rls (la app usa el rol admin
-- de Supabase, que tiene BYPASSRLS).
-- ---------------------------------------------------------------------------

ALTER TABLE "friendships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "friendships" FORCE ROW LEVEL SECURITY;

-- Visible a cualquiera de los dos lados (para ver solicitudes pendientes y
-- amistades ya aceptadas).
CREATE POLICY "visible_to_both_sides" ON "friendships"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "friendships"."requesterId" AND sp."userId" = auth.uid())
    OR EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "friendships"."addresseeId" AND sp."userId" = auth.uid())
  );

-- Solo puedes mandar la solicitud como tú mismo.
CREATE POLICY "request_as_self" ON "friendships"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "friendships"."requesterId" AND sp."userId" = auth.uid())
  );

-- Solo quien recibió la solicitud puede aceptarla.
CREATE POLICY "addressee_responds" ON "friendships"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "friendships"."addresseeId" AND sp."userId" = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "friendships"."addresseeId" AND sp."userId" = auth.uid())
  );

-- Cualquiera de los dos lados puede borrar (rechazar una solicitud o dejar
-- de ser amigos).
CREATE POLICY "either_side_deletes" ON "friendships"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "friendships"."requesterId" AND sp."userId" = auth.uid())
    OR EXISTS (SELECT 1 FROM "student_profiles" sp WHERE sp."id" = "friendships"."addresseeId" AND sp."userId" = auth.uid())
  );
