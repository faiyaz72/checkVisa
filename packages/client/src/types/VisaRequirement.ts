export type DataRequest = {
  originCountryCode: string;
  destinationCountryCode: string;
};

export type VisaCondition = {
  id: string;
  visaRequirementId: string;
  type: string;
  description: string;
  acceptedCountries: string[];
  mustBeValid: boolean;
  durationIfMet: { maxStayDays: number } | null;
  createdAt: string;
  updatedAt: string;
};

export type VisaRequirement = {
  id: string;
  originCountryCode: string;
  destinationCountryCode: string;
  primaryRequirement: string;
  duration: { maxStayDays: number; description: string } | null;
  sourceUrl: string | null;
  lastVerified: string | null;
  notesHash: string | null;
  conditions: VisaCondition[];
  createdAt: string;
  updatedAt: string;
};
