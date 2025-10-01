/*
  Warnings:

  - A unique constraint covering the columns `[userId,accountId,hash]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Rule_userId_active_idx";

-- AlterTable
ALTER TABLE "public"."ImportFile" ADD COLUMN     "inserted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "skipped" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totals" JSONB,
ADD COLUMN     "updated" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Rule" ADD COLUMN     "isRegex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "balanceAfter" DECIMAL(14,2),
ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Rule_userId_active_priority_idx" ON "public"."Rule"("userId", "active", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_userId_accountId_hash_key" ON "public"."Transaction"("userId", "accountId", "hash");
