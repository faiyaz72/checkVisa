/*
  Warnings:

  - The `logic` column on the `VisaCondition` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `entryType` column on the `VisaRequirement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `confidence` column on the `VisaRequirement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `VisaCondition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `primaryRequirement` on the `VisaRequirement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "VisaCondition" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "logic",
ADD COLUMN     "logic" TEXT NOT NULL DEFAULT 'OR';

-- AlterTable
ALTER TABLE "VisaRequirement" DROP COLUMN "primaryRequirement",
ADD COLUMN     "primaryRequirement" TEXT NOT NULL,
DROP COLUMN "entryType",
ADD COLUMN     "entryType" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
DROP COLUMN "confidence",
ADD COLUMN     "confidence" TEXT NOT NULL DEFAULT 'MEDIUM';

-- DropEnum
DROP TYPE "ConditionLogic";

-- DropEnum
DROP TYPE "ConditionType";

-- DropEnum
DROP TYPE "Confidence";

-- DropEnum
DROP TYPE "EntryType";

-- DropEnum
DROP TYPE "VisaRequirementType";

-- CreateIndex
CREATE INDEX "VisaCondition_type_idx" ON "VisaCondition"("type");

-- CreateIndex
CREATE INDEX "VisaRequirement_primaryRequirement_idx" ON "VisaRequirement"("primaryRequirement");
