
-- CreateEnum
CREATE TYPE "TutorConversationMode" AS ENUM ('SOCRATICO', 'EXPLICAR', 'PISTA', 'PRACTICA');

-- CreateEnum
CREATE TYPE "TutorMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "tutor_conversations" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "mode" "TutorConversationMode" NOT NULL DEFAULT 'EXPLICAR',
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_chat_messages" (
    "id" UUID NOT NULL,
    "tutorConversationId" UUID NOT NULL,
    "role" "TutorMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutor_conversations_studentProfileId_idx" ON "tutor_conversations"("studentProfileId");

-- CreateIndex
CREATE INDEX "tutor_conversations_subjectId_idx" ON "tutor_conversations"("subjectId");

-- CreateIndex
CREATE INDEX "tutor_chat_messages_tutorConversationId_idx" ON "tutor_chat_messages"("tutorConversationId");

-- AddForeignKey
ALTER TABLE "tutor_conversations" ADD CONSTRAINT "tutor_conversations_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_conversations" ADD CONSTRAINT "tutor_conversations_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_chat_messages" ADD CONSTRAINT "tutor_chat_messages_tutorConversationId_fkey" FOREIGN KEY ("tutorConversationId") REFERENCES "tutor_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

