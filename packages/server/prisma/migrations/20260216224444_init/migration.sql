-- CreateEnum
CREATE TYPE "VisaRequirementType" AS ENUM ('VISA_FREE', 'VISA_ON_ARRIVAL', 'ETA', 'EVISA', 'VISA_REQUIRED', 'CONDITIONAL_WAIVER', 'ADMISSION_REFUSED', 'SPECIAL_TERRITORY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('SINGLE', 'MULTIPLE', 'TRANSIT_ONLY', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('REQUIRES_VISA', 'REQUIRES_DOCUMENT', 'REQUIRES_RESIDENCY', 'REQUIRES_PURPOSE', 'REQUIRES_ARRIVAL_METHOD', 'REQUIRES_DEPARTURE', 'AGE_RESTRICTION', 'INCOME_REQUIREMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ConditionLogic" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "VisaRequirement" (
    "id" TEXT NOT NULL,
    "originCountryCode" TEXT NOT NULL,
    "destinationCountryCode" TEXT NOT NULL,
    "primaryRequirement" "VisaRequirementType" NOT NULL,
    "entryType" "EntryType" NOT NULL DEFAULT 'UNSPECIFIED',
    "duration" JSONB,
    "processingTime" TEXT,
    "restrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceUrl" TEXT,
    "lastVerified" TIMESTAMP(3),
    "confidence" "Confidence" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaCondition" (
    "id" TEXT NOT NULL,
    "visaRequirementId" TEXT NOT NULL,
    "type" "ConditionType" NOT NULL,
    "description" TEXT NOT NULL,
    "logic" "ConditionLogic" NOT NULL DEFAULT 'OR',
    "requiredDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "durationIfMet" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequiredVisa" (
    "id" TEXT NOT NULL,
    "visaConditionId" TEXT NOT NULL,
    "issuingCountry" TEXT NOT NULL,
    "issuingCountryCode" TEXT,
    "visaTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mustBeValid" BOOLEAN NOT NULL DEFAULT true,
    "mustBeUsed" BOOLEAN NOT NULL DEFAULT false,
    "minValidityDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequiredVisa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisaRequirement_originCountryCode_idx" ON "VisaRequirement"("originCountryCode");

-- CreateIndex
CREATE INDEX "VisaRequirement_destinationCountryCode_idx" ON "VisaRequirement"("destinationCountryCode");

-- CreateIndex
CREATE INDEX "VisaRequirement_primaryRequirement_idx" ON "VisaRequirement"("primaryRequirement");

-- CreateIndex
CREATE UNIQUE INDEX "VisaRequirement_originCountryCode_destinationCountryCode_key" ON "VisaRequirement"("originCountryCode", "destinationCountryCode");

-- CreateIndex
CREATE INDEX "VisaCondition_visaRequirementId_idx" ON "VisaCondition"("visaRequirementId");

-- CreateIndex
CREATE INDEX "VisaCondition_type_idx" ON "VisaCondition"("type");

-- CreateIndex
CREATE INDEX "RequiredVisa_visaConditionId_idx" ON "RequiredVisa"("visaConditionId");

-- CreateIndex
CREATE INDEX "RequiredVisa_issuingCountryCode_idx" ON "RequiredVisa"("issuingCountryCode");

-- AddForeignKey
ALTER TABLE "VisaCondition" ADD CONSTRAINT "VisaCondition_visaRequirementId_fkey" FOREIGN KEY ("visaRequirementId") REFERENCES "VisaRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequiredVisa" ADD CONSTRAINT "RequiredVisa_visaConditionId_fkey" FOREIGN KEY ("visaConditionId") REFERENCES "VisaCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
