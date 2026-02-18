import { Controller, Get, Query } from "@nestjs/common";
import { DataService } from "./data.service";

@Controller("data")
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  getData(
    @Query("originCountryCode") originCountryCode: string,
    @Query("destinationCountryCode") destinationCountryCode: string,
  ) {
    return this.dataService.getData(originCountryCode, destinationCountryCode);
  }
}
