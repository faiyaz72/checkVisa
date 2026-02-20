import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  RecoverScrapedDataFromFileRequest,
  ScraperRequest,
} from "./request/ScraperRequest.vo";
import { ScraperAuthGuard } from "./scraper-auth.guard";
import { ScraperService } from "./scraper.service";

@ApiTags("scraper")
@Controller("scraper")
@UseGuards(ScraperAuthGuard)
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post()
  @ApiBody({ type: ScraperRequest })
  @ApiResponse({ status: 201, description: "Scrape completed successfully" })
  scrape(@Body() request: ScraperRequest) {
    return this.scraperService.scrape(request);
  }

  @Post("recover")
  @ApiBody({ type: RecoverScrapedDataFromFileRequest })
  @ApiResponse({ status: 201, description: "Recovered scraped data from file" })
  recoverScrapedDataFromFile(
    @Body() request: RecoverScrapedDataFromFileRequest,
  ) {
    return this.scraperService.recoverScrapedDataFromFile(request.countryCd);
  }
}
