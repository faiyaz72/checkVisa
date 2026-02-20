import { Body, Controller, Post } from "@nestjs/common";
import { DataService } from "./data.service";
import { ApiResponse } from "@nestjs/swagger";
import { DataRequest } from "./request/DataRequest.vo";
import { ApiBody } from "@nestjs/swagger";

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
}
