/*
  Warnings:

  - A unique constraint covering the columns `[chatName]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_chatName_key" ON "Chat"("chatName");
