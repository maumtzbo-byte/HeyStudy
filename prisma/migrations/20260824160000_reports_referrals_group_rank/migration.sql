-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "deadlineRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastDeadlineReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "lastParentReportSentAt" TIMESTAMP(3),
ADD COLUMN     "lastWeeklyReportSentAt" TIMESTAMP(3),
ADD COLUMN     "parentEmail" TEXT,
ADD COLUMN     "parentReportEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredByStudentProfileId" UUID,
ADD COLUMN     "weeklyReportEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "study_group_members" ADD COLUMN     "lastKnownRank" INTEGER;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "bonusPaidUntil" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_referralCode_key" ON "student_profiles"("referralCode");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_referredByStudentProfileId_fkey" FOREIGN KEY ("referredByStudentProfileId") REFERENCES "student_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
