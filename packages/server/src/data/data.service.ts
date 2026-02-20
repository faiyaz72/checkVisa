import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class DataService {
  private readonly logger = new LoggerService(DataService.name);
  constructor(private readonly dbService: DbService) {}

  async getData(originCountryCode: string, destinationCountryCode: string) {
    this.logger.log(
      `Getting data for ${originCountryCode} -> ${destinationCountryCode}`,
    );
    return await this.dbService.client.visaRequirement.findUnique({
      where: {
        originCountryCode_destinationCountryCode: {
          originCountryCode: originCountryCode,
          destinationCountryCode: destinationCountryCode,
        },
      },
      include: {
        conditions: true,
      },
    });
  }
}
