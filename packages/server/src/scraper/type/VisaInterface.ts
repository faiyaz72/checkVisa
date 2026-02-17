import {
  ConditionType,
  EntryType,
  VisaRequirementType,
} from "../enum/VisaRequirement.enum";

export interface LlmRequest {
  destinationCountryCd: string;
  originCountryCd: string;
  visaType: VisaRequirementType;
  rawRequirement: string;
  duration?: DurationInfo;
  allowedStay?: string;
  notes?: string;
  notesHash?: string;
  lastVerified: string;
  sourceUrl: string;
}

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

export interface VisaRequirement {
  destinationCountryCd: string;
  originCountryCd: string;
  primaryRequirement: VisaRequirementType;
  duration?: DurationInfo;
  conditions?: VisaCondition[];
  entryType?: EntryType;
  processingTime?: string;
  restrictions?: string[];
  notesHash?: string;
  sourceUrl?: string;
  lastVerified?: string;
  confidence?: "high" | "medium" | "low";
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
