import { http } from "@/services/http.client";
import routes from "@/routes.json";
import type { DataRequest, VisaRequirement } from "@/types/VisaRequirement";
import type {
  PaginatedResponse,
  SummaryItem,
  SummaryRequest,
} from "@/types/summary";

export async function getRequirementData(
  request: DataRequest,
): Promise<VisaRequirement> {
  return http.post<VisaRequirement>(routes.data.getRequirement, request);
}

export async function getSummary(
  request: SummaryRequest,
): Promise<PaginatedResponse<SummaryItem>> {
  return http.post<PaginatedResponse<SummaryItem>>(
    routes.data.getSummary,
    request,
  );
}
