/*
  Warnings:

  - Made the column `fileName` on table `Package` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "fileName" SET NOT NULL;
