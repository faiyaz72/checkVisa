import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class HealthService {
  private readonly logger = new LoggerService(HealthService.name);
  getStatus() {
    this.logger.log('Health check');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
