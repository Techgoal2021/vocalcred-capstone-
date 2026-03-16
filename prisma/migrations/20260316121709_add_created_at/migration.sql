-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "name" TEXT,
    "businessName" TEXT,
    "businessType" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ARTISAN',
    "image" TEXT,
    "vocalcred_id" TEXT,
    "skill" TEXT,
    "jobs_completed" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" REAL NOT NULL DEFAULT 0.0,
    "repeat_clients" INTEGER NOT NULL DEFAULT 0,
    "reputation" INTEGER,
    "skill_score" INTEGER,
    "loan_score" INTEGER,
    "payer_score" INTEGER DEFAULT 500,
    "has_voice" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT DEFAULT 'en',
    "bio" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "website" TEXT
);
INSERT INTO "new_User" ("avg_rating", "bio", "businessName", "businessType", "email", "emailVerified", "has_voice", "id", "image", "instagram", "jobs_completed", "language", "loan_score", "name", "payer_score", "phone", "repeat_clients", "reputation", "role", "skill", "skill_score", "twitter", "vocalcred_id", "website") SELECT "avg_rating", "bio", "businessName", "businessType", "email", "emailVerified", "has_voice", "id", "image", "instagram", "jobs_completed", "language", "loan_score", "name", "payer_score", "phone", "repeat_clients", "reputation", "role", "skill", "skill_score", "twitter", "vocalcred_id", "website" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_vocalcred_id_key" ON "User"("vocalcred_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
