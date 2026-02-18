import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

@Injectable()
export class DataService {
  constructor(private readonly dbService: DbService) {}

  async getData(originCountryCode: string, destinationCountryCode: string) {
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
