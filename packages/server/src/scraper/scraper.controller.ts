import { Controller, Get, Query } from "@nestjs/common";
import { ScraperService } from "./scraper.service";

@Controller("scraper")
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get()
  scrape(@Query("country") country: string) {
    return this.scraperService.scrape(country);
  }
}
