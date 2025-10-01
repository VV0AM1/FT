/*
  Warnings:

  - Added the required column `contentType` to the `ImportFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `ImportFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `ImportFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ImportFile" ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
