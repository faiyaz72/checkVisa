import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";
import { LoggerService } from "../logger/logger.service";
import { PaginatedResponse } from "../lib/pagination";
import type { SummaryItem } from "./type/SummaryItem";
import type { Prisma } from "../../generated/prisma/client";
import { VisaRequirementType } from "../scraper/enum/VisaRequirement.enum";

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

  async getSummary(
    originPassportCountryCode: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResponse<SummaryItem>> {
    this.logger.log(
      `Getting summary for ${originPassportCountryCode} (page ${page}, pageSize ${pageSize})`,
    );

    const where: Prisma.VisaRequirementWhereInput = {
      originCountryCode: originPassportCountryCode,
      primaryRequirement: {
        notIn: [VisaRequirementType.VISA_REQUIRED, VisaRequirementType.UNKNOWN],
      },
    };

    const [data, total] = await Promise.all([
      this.dbService.client.visaRequirement.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { destinationCountryCode: "asc" },
      }),
      this.dbService.client.visaRequirement.count({ where }),
    ]);

    return { data, page, pageSize, total };
  }
}
