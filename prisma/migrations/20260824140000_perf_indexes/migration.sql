-- CreateIndex
CREATE INDEX "knowledge_mastery_studentProfileId_nextReview_idx" ON "knowledge_mastery"("studentProfileId", "nextReview");

-- CreateIndex
CREATE INDEX "error_patterns_studentProfileId_knowledgeTopicId_idx" ON "error_patterns"("studentProfileId", "knowledgeTopicId");
