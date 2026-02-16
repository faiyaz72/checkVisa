import { Module } from "@nestjs/common";
import { ScraperController } from "./scraper.controller";
import { ScraperService } from "./scraper.service";
import { LoggerModule } from "../logger/logger.module";

@Module({
  imports: [LoggerModule],
  controllers: [ScraperController],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
