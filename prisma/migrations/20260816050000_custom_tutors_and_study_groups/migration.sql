-- CreateEnum
CREATE TYPE "StudyGroupRole" AS ENUM ('OWNER', 'MIEMBRO');

-- AlterTable
ALTER TABLE "tutor_conversations" ADD COLUMN "customTutorId" UUID;

-- CreateTable
CREATE TABLE "custom_tutors" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🎓',
    "instructions" TEXT NOT NULL,
    "baseMode" "TutorConversationMode" NOT NULL DEFAULT 'EXPLICAR',
    "subjectId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_tutors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_groups" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_group_members" (
    "id" UUID NOT NULL,
    "studyGroupId" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "role" "StudyGroupRole" NOT NULL DEFAULT 'MIEMBRO',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_study_plans" (
    "id" UUID NOT NULL,
    "studyPlanId" UUID NOT NULL,
    "studyGroupId" UUID NOT NULL,
    "sharedById" UUID NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_study_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_tutors_studentProfileId_idx" ON "custom_tutors"("studentProfileId");

-- CreateIndex
CREATE INDEX "custom_tutors_subjectId_idx" ON "custom_tutors"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "study_groups_joinCode_key" ON "study_groups"("joinCode");

-- CreateIndex
CREATE INDEX "study_groups_ownerId_idx" ON "study_groups"("ownerId");

-- CreateIndex
CREATE INDEX "study_group_members_studyGroupId_idx" ON "study_group_members"("studyGroupId");

-- CreateIndex
CREATE INDEX "study_group_members_studentProfileId_idx" ON "study_group_members"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "study_group_members_studyGroupId_studentProfileId_key" ON "study_group_members"("studyGroupId", "studentProfileId");

-- CreateIndex
CREATE INDEX "shared_study_plans_studyGroupId_idx" ON "shared_study_plans"("studyGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_study_plans_studyPlanId_studyGroupId_key" ON "shared_study_plans"("studyPlanId", "studyGroupId");

-- AddForeignKey
ALTER TABLE "custom_tutors" ADD CONSTRAINT "custom_tutors_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_tutors" ADD CONSTRAINT "custom_tutors_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_conversations" ADD CONSTRAINT "tutor_conversations_customTutorId_fkey" FOREIGN KEY ("customTutorId") REFERENCES "custom_tutors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_groups" ADD CONSTRAINT "study_groups_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "study_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_study_plans" ADD CONSTRAINT "shared_study_plans_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_study_plans" ADD CONSTRAINT "shared_study_plans_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "study_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_study_plans" ADD CONSTRAINT "shared_study_plans_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
