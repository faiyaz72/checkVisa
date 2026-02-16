import { Injectable } from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";
import * as cheerio from "cheerio";
import { VisaType } from "./enum/VisaType.enum";
import { ScrapedData, VisaInterface } from "./type/VisaInterface";
import countries from "world-countries";
import { LlmService } from "./llm.service";

@Injectable()
export class ScraperService {
  private readonly logger = new LoggerService(ScraperService.name);

  constructor(private readonly llmService: LlmService) {}

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
    const convertedData = this.convertToDbFormat(scrapedData);
    const parsedData = await this.llmService.parseVisaRequirement(
      convertedData[111],
    );
    return parsedData;
  }

  private convertToDbFormat(scrapedData: ScrapedData): any[] {
    return scrapedData.entries.map((entry) => ({
      country: entry.country,
      visaType: this.categorizeVisaRequirement(entry.visaRequirement),
      rawRequirement: entry.visaRequirement,
      durationDays: this.extractDuration(
        entry.allowedStay || entry.notes || "",
      ),
      allowedStay: entry.allowedStay,
      notes: entry.notes,
      lastVerified: scrapedData.lastUpdated,
      sourceUrl: `https://en.wikipedia.org/wiki/Visa_requirements_for_${scrapedData.passportCountry}_citizens`,
    }));
  }

  private categorizeVisaRequirement(requirement: string): VisaType {
    const req = requirement.toLowerCase();

    if (req.includes("visa not required") || req.includes("visa free")) {
      return VisaType.VISA_FREE;
    }
    if (req.includes("visa on arrival") || req.includes("voa")) {
      return VisaType.VISA_ON_ARRIVAL;
    }
    if (
      req.includes("evisa") ||
      req.includes("e-visa") ||
      req.includes("electronic")
    ) {
      return VisaType.EVISA;
    }
    if (req.includes("eta") || req.includes("electronic travel")) {
      return VisaType.ETA;
    }
    if (req.includes("visa required")) {
      return VisaType.VISA_REQUIRED;
    }
    if (req.includes("admission refused") || req.includes("travel ban")) {
      return VisaType.ADMISSION_REFUSED;
    }

    // Check for conditional visa waiver
    if (
      req.includes("visa waiver") ||
      req.includes("with visa") ||
      req.includes("holding")
    ) {
      return VisaType.VISA_WAIVER;
    }

    return VisaType.UNKNOWN;
  }

  private extractDuration(text: string): number | null {
    if (!text) return null;

    const lowerText = text.toLowerCase();

    // Match patterns like "90 days", "3 months", "1 year"
    const daysMatch = lowerText.match(/(\d+)\s*days?/);
    if (daysMatch) {
      return parseInt(daysMatch[1]);
    }

    const monthsMatch = lowerText.match(/(\d+)\s*months?/);
    if (monthsMatch) {
      return parseInt(monthsMatch[1]) * 30;
    }

    const yearsMatch = lowerText.match(/(\d+)\s*years?/);
    if (yearsMatch) {
      return parseInt(yearsMatch[1]) * 365;
    }

    return null;
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
