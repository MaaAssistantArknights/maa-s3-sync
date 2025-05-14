/*
  Warnings:

  - Added the required column `syncId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "syncId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "PackageSync"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
