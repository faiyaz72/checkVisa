import { Module } from "@nestjs/common";
import { ScraperController } from "./scraper.controller";
import { ScraperService } from "./scraper.service";
import { LoggerModule } from "../logger/logger.module";
import { ConfigModule } from "../config/config.module";
import { LlmService } from "./llm.service";

@Module({
  imports: [LoggerModule, ConfigModule],
  controllers: [ScraperController],
  providers: [ScraperService, LlmService],
  exports: [ScraperService],
})
export class ScraperModule {}
