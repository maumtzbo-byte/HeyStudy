-- AlterTable
ALTER TABLE "tutor_conversations" ADD COLUMN "notes" TEXT,
ADD COLUMN "notesGeneratedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN "learningStyleNotes" TEXT;
