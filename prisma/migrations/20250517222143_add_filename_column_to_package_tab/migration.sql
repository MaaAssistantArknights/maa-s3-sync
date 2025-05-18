/*
  Warnings:

  - A unique constraint covering the columns `[fileName]` on the table `Package` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "fileName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Package_fileName_key" ON "Package"("fileName");
