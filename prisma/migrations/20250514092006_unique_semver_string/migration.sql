/*
  Warnings:

  - A unique constraint covering the columns `[display]` on the table `Version` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Version_display_key" ON "Version"("display");
