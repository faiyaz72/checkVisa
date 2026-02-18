import { Body, Controller, Post } from "@nestjs/common";
import { ScraperService } from "./scraper.service";

@Controller("scraper")
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post()
  scrape(@Body() request: { countryCd: string }) {
    return this.scraperService.scrape(request.countryCd);
  }
}
