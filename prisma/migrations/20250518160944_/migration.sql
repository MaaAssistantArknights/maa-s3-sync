/*
  Warnings:

  - You are about to drop the column `logFile` on the `PackageSync` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PackageSync` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PackageSync" DROP COLUMN "logFile",
DROP COLUMN "status";
