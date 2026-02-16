export interface VisaInterface {
  country: string;
  visaRequirement: string;
  allowedStay?: string;
  notes?: string;
}

export interface ScrapedData {
  passportCountry: string;
  lastUpdated: Date;
  entries: VisaInterface[];
  rawTableCount: number;
}

export interface ParsedVisaRequirement {
  destinationCountry: string;
  primaryRequirement: VisaRequirementType;
  duration?: DurationInfo;
  conditions?: VisaCondition[];
  entryType?: EntryType;
  processingTime?: string;
  restrictions?: string[];
  sourceUrl?: string;
  lastVerified?: string;
  confidence?: "high" | "medium" | "low";
}

export enum VisaRequirementType {
  VISA_FREE = "VISA_FREE",
  VISA_ON_ARRIVAL = "VISA_ON_ARRIVAL",
  ETA = "ETA",
  EVISA = "EVISA",
  VISA_REQUIRED = "VISA_REQUIRED",
  CONDITIONAL_WAIVER = "CONDITIONAL_WAIVER",
  ADMISSION_REFUSED = "ADMISSION_REFUSED",
  SPECIAL_TERRITORY = "SPECIAL_TERRITORY",
}

export enum EntryType {
  SINGLE = "SINGLE",
  MULTIPLE = "MULTIPLE",
  TRANSIT_ONLY = "TRANSIT_ONLY",
  UNSPECIFIED = "UNSPECIFIED",
}

export interface DurationInfo {
  maxStayDays?: number;
  maxStayMonths?: number;
  maxStayYears?: number;
  validityDays?: number;
  validityMonths?: number;
  validityYears?: number;
  description?: string;
  perVisit?: boolean;
  perPeriod?: string;
  cumulative?: boolean;
}

export enum ConditionType {
  REQUIRES_VISA = "REQUIRES_VISA",
  REQUIRES_DOCUMENT = "REQUIRES_DOCUMENT",
  REQUIRES_RESIDENCY = "REQUIRES_RESIDENCY",
  REQUIRES_PURPOSE = "REQUIRES_PURPOSE",
  REQUIRES_ARRIVAL_METHOD = "REQUIRES_ARRIVAL_METHOD",
  REQUIRES_DEPARTURE = "REQUIRES_DEPARTURE",
  AGE_RESTRICTION = "AGE_RESTRICTION",
  INCOME_REQUIREMENT = "INCOME_REQUIREMENT",
  OTHER = "OTHER",
}

export interface VisaCondition {
  type: ConditionType;
  requiredVisas?: RequiredVisa[];
  requiredDocuments?: string[];
  durationIfMet?: DurationInfo;
  description: string;
  logic?: "AND" | "OR";
}

export interface RequiredVisa {
  issuingCountry: string;
  issuingCountryCode?: string;
  visaTypes?: string[];
  mustBeValid?: boolean;
  mustBeUsed?: boolean;
  minValidityDays?: number;
}
