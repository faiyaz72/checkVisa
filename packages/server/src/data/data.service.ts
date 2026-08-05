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

    const [data, totalRecords] = await Promise.all([
      this.dbService.client.visaRequirement.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { destinationCountryCode: "asc" },
        select: {
          id: true,
          originCountryCode: true,
          destinationCountryCode: true,
          primaryRequirement: true,
        },
      }),
      this.dbService.client.visaRequirement.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    return { data, page, pageSize, totalRecords, totalPages };
  }
}
