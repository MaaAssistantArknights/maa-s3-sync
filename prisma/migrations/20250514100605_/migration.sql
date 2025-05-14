/*
  Warnings:

  - A unique constraint covering the columns `[nodeId]` on the table `Package` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "nodeId" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Package_nodeId_key" ON "Package"("nodeId");
