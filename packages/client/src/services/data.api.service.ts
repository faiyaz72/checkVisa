import { http } from "@/services/http.client";
import routes from "@/routes.json";
import type { DataRequest, VisaRequirement } from "@/types/VisaRequirement";

export async function getRequirementData(
  request: DataRequest,
): Promise<VisaRequirement> {
  return http.post<VisaRequirement>(routes.data.getRequirement, request);
}
