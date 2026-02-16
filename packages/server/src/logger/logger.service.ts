import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class LoggerService {
  private readonly logger: Logger;
  private readonly context: string;
  constructor(context: string) {
    this.logger = new Logger();
    this.context = context;
  }

  log(message: string) {
    this.logger.log(this.formatMessage(message));
  }

  error(message: string) {
    this.logger.error(this.formatMessage(message));
  }

  warn(message: string) {
    this.logger.warn(this.formatMessage(message));
  }

  debug(message: string) {
    this.logger.debug(this.formatMessage(message));
  }

  private formatMessage(message: string) {
    return `[${this.context}] ${new Date().toISOString()} - ${message}`;
  }

}