import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiResponse } from "@nestjs/swagger";
import { DataService } from "./data.service";
import { DataRequest, SummaryRequest } from "./request/DataRequest.vo";
import { PaginatedResponse, PaginatedResponseDto } from "../lib/pagination";
import { SummaryItemDto } from "./type/SummaryItemDto";

@Controller("data")
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post()
  @ApiBody({ type: DataRequest })
  @ApiResponse({
    status: 200,
    description: "The data for the given origin and destination country codes",
  })
  getData(@Body() request: DataRequest) {
    return this.dataService.getData(
      request.originCountryCode,
      request.destinationCountryCode,
    );
  }

  @Post("summary")
  @ApiBody({ type: SummaryRequest })
  @ApiResponse({
    status: 200,
    description: "Paginated visa summary for the given origin passport country",
    type: PaginatedResponseDto(SummaryItemDto),
  })
  getSummary(
    @Body() request: SummaryRequest,
  ): Promise<PaginatedResponse<SummaryItemDto>> {
    return this.dataService.getSummary(
      request.originPassportCountryCode,
      request.page,
      request.pageSize,
    );
  }
}
