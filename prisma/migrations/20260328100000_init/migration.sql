-- CreateTable
CREATE TABLE "AdminCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Judge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "privateToken" TEXT NOT NULL,
    "judge1Id" TEXT NOT NULL,
    "judge2Id" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_judge1Id_fkey" FOREIGN KEY ("judge1Id") REFERENCES "Judge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_judge2Id_fkey" FOREIGN KEY ("judge2Id") REFERENCES "Judge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "slNo" INTEGER NOT NULL,
    "chestNo" TEXT NOT NULL,
    "codeLetter" TEXT NOT NULL,
    "placement" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Participant_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participantId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "mark" REAL,
    "grade" TEXT,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Score_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Score_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JudgeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JudgeSubmission_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JudgeSubmission_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResultAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResultAuditLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Judge_name_key" ON "Judge"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Item_privateToken_key" ON "Item"("privateToken");

-- CreateIndex
CREATE INDEX "Participant_itemId_placement_idx" ON "Participant"("itemId", "placement");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_itemId_chestNo_key" ON "Participant"("itemId", "chestNo");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_itemId_codeLetter_key" ON "Participant"("itemId", "codeLetter");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_itemId_slNo_key" ON "Participant"("itemId", "slNo");

-- CreateIndex
CREATE UNIQUE INDEX "Score_participantId_judgeId_key" ON "Score"("participantId", "judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeSubmission_itemId_judgeId_key" ON "JudgeSubmission"("itemId", "judgeId");

-- CreateIndex
CREATE INDEX "ResultAuditLog_itemId_createdAt_idx" ON "ResultAuditLog"("itemId", "createdAt");
