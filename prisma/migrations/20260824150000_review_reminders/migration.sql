-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "lastReviewReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "reviewRemindersEnabled" BOOLEAN NOT NULL DEFAULT true;
