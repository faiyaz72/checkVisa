import { Injectable } from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";
import * as cheerio from "cheerio";
import {
  DurationInfo,
  LlmRequest,
  ScrapedData,
  VisaInterface,
  VisaRequirement,
} from "./type/VisaInterface";
import countries from "world-countries";
import { LlmService } from "./llm.service";
import { VisaRequirementType } from "./enum/VisaRequirement.enum";
import { manualCountryCodeMapping } from "./const/ManualCountryData";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs/promises";
import { DbService } from "../db/db.service";
import { Prisma } from "../../generated/prisma/client";

@Injectable()
export class ScraperService {
  private readonly logger = new LoggerService(ScraperService.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly dbService: DbService,
  ) {}

  async scrape(countryCd: string) {
    const countryData = countries.find((c) => c.cca2 === countryCd);
    if (!countryData) {
      this.logger.error(`Country not found: ${countryCd}`);
      return [];
    }
    this.logger.log(`Scraping data for ${countryData.name.common}`);
    const scrapedData = await this.scrapeWikipediaVisaRequirements(
      countryData.demonyms["eng"]?.m,
    );
    const llmRequests = this.convertToLlmRequest(scrapedData, countryCd);
    // TODO: revert to LLM – temporarily load from file to save LLM calls
    // const parsedData = await this.loadParsedDataFromFile(`${countryCd}-VISA.json`);
    const parsedData = await this.llmService.parseVisaRequirement(llmRequests);
    await this.writeToFile(`${countryCd}-VISA.json`, parsedData);

    return await this.saveVisaRequirements(countryCd, parsedData);
  }

  private async writeToFile(filename: string, data: VisaRequirement[]) {
    this.logger.log(
      `Writing ${data.length} visa requirements to file ${filename}`,
    );
    const filePath = path.join(__dirname, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async saveVisaRequirements(
    originCountryCode: string,
    visaRequirements: VisaRequirement[],
  ) {
    this.logger.log(
      `Saving ${visaRequirements.length} visa requirements for ${originCountryCode}`,
    );

    return await this.dbService.client.$transaction(
      async (tx) => {
        // Step 1: Delete existing
        const deleted = await tx.visaRequirement.deleteMany({
          where: { originCountryCode },
        });
        this.logger.log(`Deleted ${deleted.count} existing requirements`);

        // Step 2: Dedupe by (origin, destination) – same pair in batch causes unique constraint error
        const seen = new Set<string>();
        const uniqueRequirements: VisaRequirement[] = [];
        for (const req of visaRequirements) {
          if (req.originCountryCd === req.destinationCountryCd) {
            this.logger.warn(
              `Skipping same country: ${req.originCountryCd} -> ${req.destinationCountryCd}`,
            );
            continue;
          }
          const key = `${req.originCountryCd}|${req.destinationCountryCd}`;
          if (seen.has(key)) {
            this.logger.warn(
              `Skipping duplicate: ${req.originCountryCd} -> ${req.destinationCountryCd}`,
            );
            continue;
          }
          seen.add(key);
          uniqueRequirements.push(req);
        }

        const requirementData = uniqueRequirements.map((req) => ({
          originCountryCode: req.originCountryCd,
          destinationCountryCode: req.destinationCountryCd,
          primaryRequirement: req.primaryRequirement,
          duration:
            req.duration == null
              ? Prisma.JsonNull
              : (req.duration as Prisma.InputJsonValue),
          sourceUrl: req.sourceUrl ?? null,
          lastVerified: req.lastVerified
            ? new Date(req.lastVerified)
            : new Date(),
          notesHash: req.notesHash ?? null,
        }));

        const created = await tx.visaRequirement.createManyAndReturn({
          data: requirementData,
          select: { id: true },
        });

        // Step 3: Bulk create conditions – same order as uniqueRequirements
        const conditionsData: {
          visaRequirementId: string;
          type: string;
          description: string;
          acceptedCountries: string[];
          mustBeValid: boolean;
          durationIfMet: Prisma.InputJsonValue | typeof Prisma.JsonNull;
        }[] = [];
        for (let i = 0; i < uniqueRequirements.length; i++) {
          const req = uniqueRequirements[i]!;
          const requirementId = created[i]!.id;
          if (req.conditions?.length) {
            for (const condition of req.conditions) {
              conditionsData.push({
                visaRequirementId: requirementId,
                type: condition.type,
                description: condition.description,
                acceptedCountries: condition.acceptedCountries,
                mustBeValid: condition.mustBeValid ?? true,
                durationIfMet:
                  condition.durationIfMet == null
                    ? Prisma.JsonNull
                    : (condition.durationIfMet as Prisma.InputJsonValue),
              });
            }
          }
        }

        if (conditionsData.length > 0) {
          await tx.visaCondition.createMany({ data: conditionsData });
        }

        this.logger.log(
          `Created ${created.length} requirements, ${conditionsData.length} conditions`,
        );
        return { deleted: deleted.count, created: created.length };
      },
      {
        timeout: 60_000, // max duration transaction can run
        maxWait: 15_000, // max time to wait to acquire a connection (default 2s)
      },
    );
  }

  /** Temporarily load parsed visa data from a JSON file to avoid LLM calls. */
  private async loadParsedDataFromFile(
    filename: string,
  ): Promise<VisaRequirement[]> {
    const filePath = path.join(__dirname, filename);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as VisaRequirement[];
  }

  private convertToLlmRequest(
    scrapedData: ScrapedData,
    originCountryCd: string,
  ): LlmRequest[] {
    return scrapedData.entries.map((entry) => ({
      destinationCountryCd: this.getCountryCodeByName(entry.country),
      originCountryCd,
      visaType: this.categorizeVisaRequirement(entry.visaRequirement),
      rawRequirement: entry.visaRequirement,
      durationDays: this.extractDuration(
        entry.allowedStay ?? entry.notes ?? "",
      ),
      allowedStay: entry.allowedStay,
      notes: entry.notes,
      notesHash: crypto
        .createHash("md5")
        .update(entry.notes?.trim() ?? "")
        .digest("hex"),
      lastVerified:
        typeof scrapedData.lastUpdated === "string"
          ? scrapedData.lastUpdated
          : scrapedData.lastUpdated.toISOString(),
      sourceUrl: `https://en.wikipedia.org/wiki/Visa_requirements_for_${scrapedData.passportCountry}_citizens`,
    }));
  }

  private getCountryCodeByName(countryName: string): string {
    const normalized = countryName.trim().toLowerCase();
    const manualMatch =
      manualCountryCodeMapping[
        normalized as keyof typeof manualCountryCodeMapping
      ];
    if (manualMatch) {
      return manualMatch;
    }
    const match = countries.find(
      (c) =>
        c.name.common.toLowerCase() === normalized ||
        c.name.official?.toLowerCase() === normalized ||
        c.altSpellings?.some((s) => s.toLowerCase() === normalized),
    );
    if (!match) {
      this.logger.error(`Country not found: ${countryName}`);
      return "XX";
    }
    return match.cca2;
  }

  private categorizeVisaRequirement(requirement: string): VisaRequirementType {
    const req = requirement.toLowerCase();

    if (req.includes("visa not required") || req.includes("visa free")) {
      return VisaRequirementType.VISA_FREE;
    }
    if (req.includes("visa on arrival") || req.includes("voa")) {
      return VisaRequirementType.VISA_ON_ARRIVAL;
    }
    if (
      req.includes("evisa") ||
      req.includes("e-visa") ||
      req.includes("electronic")
    ) {
      return VisaRequirementType.EVISA;
    }
    if (req.includes("eta") || req.includes("electronic travel")) {
      return VisaRequirementType.ETA;
    }
    if (req.includes("visa required")) {
      return VisaRequirementType.VISA_REQUIRED;
    }
    if (req.includes("admission refused") || req.includes("travel ban")) {
      return VisaRequirementType.ADMISSION_REFUSED;
    }

    // Check for conditional visa waiver
    if (
      req.includes("visa waiver") ||
      req.includes("with visa") ||
      req.includes("holding")
    ) {
      return VisaRequirementType.CONDITIONAL_WAIVER;
    }

    return VisaRequirementType.UNKNOWN;
  }

  private extractDuration(text: string): DurationInfo | undefined {
    if (!text) return undefined;

    const lowerText = text.toLowerCase();

    // Match patterns like "90 days", "3 months", "1 year"
    const daysMatch = lowerText.match(/(\d+)\s*days?/);
    if (daysMatch) {
      return { maxStayDays: parseInt(daysMatch[1]) };
    }

    const monthsMatch = lowerText.match(/(\d+)\s*months?/);
    if (monthsMatch) {
      return { maxStayMonths: parseInt(monthsMatch[1]) };
    }

    const yearsMatch = lowerText.match(/(\d+)\s*years?/);
    if (yearsMatch) {
      return { maxStayYears: parseInt(yearsMatch[1]) };
    }

    return undefined;
  }

  private async scrapeWikipediaVisaRequirements(
    countryName: string,
  ): Promise<ScrapedData> {
    const url = `https://en.wikipedia.org/wiki/Visa_requirements_for_${countryName}_citizens`;
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const entries: VisaInterface[] = [];

    // Wikipedia visa pages typically have a sortable table with class "wikitable"
    // The table structure is usually:
    // | Country | Visa requirement | Allowed stay | Notes |

    $("table.wikitable.sortable").each((tableIndex, table) => {
      $(table)
        .find("tbody tr")
        .each((rowIndex, row) => {
          const cells = $(row).find("td");

          // Skip header rows or empty rows
          if (cells.length < 2) return;

          // First cell: Country name (often has a flag and link)
          const countryCell = $(cells[0]);
          const country =
            countryCell.find("a").first().attr("title") ||
            countryCell.text().trim();

          // Skip if no country name
          if (!country) return;

          // Second cell: Visa requirement
          const visaRequirement = $(cells[1]).text().trim();

          // Third cell: Allowed stay (optional)
          const allowedStay =
            cells.length > 2 ? $(cells[2]).text().trim() : undefined;

          // Fourth cell: Notes (optional)
          const notes =
            cells.length > 3 ? $(cells[3]).text().trim() : undefined;

          entries.push({
            country: this.cleanText(country),
            visaRequirement: this.cleanText(visaRequirement),
            allowedStay: allowedStay ? this.cleanText(allowedStay) : undefined,
            notes: notes ? this.cleanText(notes) : undefined,
          });
        });
    });

    return {
      passportCountry: countryName,
      lastUpdated: new Date(),
      entries,
      rawTableCount: $("table.wikitable.sortable").length,
    };
  }

  private cleanText(text: string): string {
    return text
      .replace(/\[\d+\]/g, "") // Remove citation numbers like [1], [2]
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }
}
