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
