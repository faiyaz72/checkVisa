import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ScraperRequest } from "./request/ScraperRequest.vo";
import { ScraperService } from "./scraper.service";

@ApiTags("scraper")
@Controller("scraper")
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post()
  @ApiBody({ type: ScraperRequest })
  @ApiResponse({ status: 201, description: "Scrape completed successfully" })
  scrape(@Body() request: ScraperRequest) {
    return this.scraperService.scrape(request.countryCd);
  }
}
