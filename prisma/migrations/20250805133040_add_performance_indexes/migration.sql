-- CreateIndex
CREATE INDEX "Conversation_tutorId_idx" ON "Conversation"("tutorId");

-- CreateIndex
CREATE INDEX "Conversation_studentId_idx" ON "Conversation"("studentId");

-- CreateIndex
CREATE INDEX "Conversation_tutorId_studentId_idx" ON "Conversation"("tutorId", "studentId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_first_name_idx" ON "User"("first_name");
