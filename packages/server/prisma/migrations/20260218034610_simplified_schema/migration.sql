/*
  Warnings:

  - You are about to drop the column `logic` on the `VisaCondition` table. All the data in the column will be lost.
  - You are about to drop the column `requiredDocuments` on the `VisaCondition` table. All the data in the column will be lost.
  - You are about to drop the column `confidence` on the `VisaRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `entryType` on the `VisaRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `processingTime` on the `VisaRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions` on the `VisaRequirement` table. All the data in the column will be lost.
  - You are about to drop the `RequiredVisa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RequiredVisa" DROP CONSTRAINT "RequiredVisa_visaConditionId_fkey";

-- DropIndex
DROP INDEX "VisaCondition_type_idx";

-- AlterTable
ALTER TABLE "VisaCondition" DROP COLUMN "logic",
DROP COLUMN "requiredDocuments",
ADD COLUMN     "acceptedCountries" TEXT[],
ADD COLUMN     "mustBeValid" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "VisaRequirement" DROP COLUMN "confidence",
DROP COLUMN "entryType",
DROP COLUMN "processingTime",
DROP COLUMN "restrictions";

-- DropTable
DROP TABLE "RequiredVisa";

-- CreateIndex
CREATE INDEX "VisaCondition_acceptedCountries_idx" ON "VisaCondition"("acceptedCountries");
