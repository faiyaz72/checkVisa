import { VisaRequirementType } from "../enum/VisaRequirement.enum";

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

/** Matches VisaRequirement model in schema. */
export interface VisaRequirement {
  destinationCountryCd: string;
  originCountryCd: string;
  primaryRequirement: string; // VISA_FREE, VISA_REQUIRED, etc.
  duration?: DurationInfo;
  notesHash?: string;
  sourceUrl?: string;
  lastVerified?: string;
  conditions?: VisaCondition[];
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

/** Matches VisaCondition model in schema. */
export interface VisaCondition {
  type: string; // REQUIRES_VISA, REQUIRES_RESIDENCY, etc.
  description: string;
  acceptedCountries: string[]; // ["US", "CA", "GB", "SCHENGEN"]
  mustBeValid?: boolean;
  durationIfMet?: DurationInfo;
}

/** Prisma findUnique result shape (originCountryCode/destinationCountryCode). Used when mapping DB rows to app VisaRequirement. */
export type VisaRequirementResponse = {
  originCountryCode: string;
  destinationCountryCode: string;
  primaryRequirement: string;
  duration: unknown;
  sourceUrl: string | null;
  lastVerified: Date | null;
  notesHash: string | null;
  conditions: Array<{
    type: string;
    description: string;
    acceptedCountries: string[];
    mustBeValid?: boolean;
    durationIfMet?: unknown;
  }>;
};
