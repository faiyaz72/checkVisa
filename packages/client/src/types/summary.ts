export type SummaryRequest = {
  originPassportCountryCode: string;
  page?: number;
  pageSize?: number;
};

export type SummaryItem = {
  id: string;
  originCountryCode: string;
  destinationCountryCode: string;
  primaryRequirement: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};
