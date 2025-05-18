-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "nodeId" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SecretKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecretKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecretKey_key_key" ON "SecretKey"("key");
