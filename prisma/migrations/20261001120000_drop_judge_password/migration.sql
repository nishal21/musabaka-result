-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Judge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Judge" ("id", "name", "createdAt", "updatedAt") SELECT "id", "name", "createdAt", "updatedAt" FROM "Judge";
DROP TABLE "Judge";
ALTER TABLE "new_Judge" RENAME TO "Judge";
CREATE UNIQUE INDEX "Judge_name_key" ON "Judge"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
