import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [HealthModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
