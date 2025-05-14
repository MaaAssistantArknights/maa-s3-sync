/*
  Warnings:

  - You are about to drop the column `taskId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `action` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskSlug` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_taskId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "module" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "taskId",
ADD COLUMN     "taskSlug" TEXT NOT NULL;

-- DropTable
DROP TABLE "Task";
