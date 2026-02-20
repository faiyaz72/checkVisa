import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
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
  @ApiBody({
    type: ScraperRequest,
    description: "Scrape the visa requirements for a country",
  })
  @ApiHeader({
    name: "x-api-key",
    required: true,
    description: "API key for scraper",
  })
  @ApiResponse({
    status: 201,
    description: "Scrape completed successfully",
    schema: {
      type: "object",
      properties: {
        dataRetrieved: { type: "number" },
        dataCreated: { type: "number" },
        dataDeleted: { type: "number" },
      },
    },
  })
  scrape(@Body() request: ScraperRequest) {
    return this.scraperService.scrape(request);
  }

  @Post("recover")
  @ApiBody({
    type: RecoverScrapedDataFromFileRequest,
    description: "Recover scraped data from a file",
  })
  @ApiHeader({
    name: "x-api-key",
    required: true,
    description: "API key for scraper",
  })
  @ApiResponse({ status: 201, description: "Recovered scraped data from file" })
  recoverScrapedDataFromFile(
    @Body() request: RecoverScrapedDataFromFileRequest,
  ) {
    return this.scraperService.recoverScrapedDataFromFile(request.countryCd);
  }
}
