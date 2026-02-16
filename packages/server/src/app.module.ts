import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";
import { ScraperModule } from "./scraper/scraper.module";
import { ConfigModule } from "./config/config.module";

@Module({
  imports: [HealthModule, ScraperModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
