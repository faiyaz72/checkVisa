import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";
import { ScraperModule } from "./scraper/scraper.module";

@Module({
  imports: [HealthModule, ScraperModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
