import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";
import { ScraperModule } from "./scraper/scraper.module";
import { ConfigModule } from "./config/config.module";
import { DbModule } from "./db/db.module";
import { DataModule } from "./data/data.module";

@Module({
  imports: [HealthModule, ScraperModule, ConfigModule, DbModule, DataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
