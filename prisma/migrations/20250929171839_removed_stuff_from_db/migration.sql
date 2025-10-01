/*
  Warnings:

  - You are about to drop the column `chatType` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `ChatMember` table. All the data in the column will be lost.
  - You are about to drop the column `messageStatus` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `seenAt` on the `Message` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chatName" TEXT NOT NULL
);
INSERT INTO "new_Chat" ("chatName", "id") SELECT "chatName", "id" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE TABLE "new_ChatMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChatMember" ("chatId", "id", "userId") SELECT "chatId", "id", "userId" FROM "ChatMember";
DROP TABLE "ChatMember";
ALTER TABLE "new_ChatMember" RENAME TO "ChatMember";
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("chatId", "content", "id", "sentAt", "userId") SELECT "chatId", "content", "id", "sentAt", "userId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
