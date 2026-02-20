import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { DbService } from "../db/db.service";
import { LoggerService } from "../logger/logger.service";
import OpenAI from "openai";
import {
  VISA_PARSING_SYSTEM_PROMPT,
  VISA_REQUIREMENT_RESPONSE_FORMAT,
} from "./const/llm.const";
import {
  LlmRequest,
  VisaCondition,
  VisaRequirement,
  VisaRequirementResponse,
} from "./type/VisaInterface";
import pLimit from "p-limit";

@Injectable()
export class LlmService {
  private readonly logger = new LoggerService(LlmService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly dbService: DbService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get("OPENAI_API_KEY"),
    });
  }

  async parseVisaRequirement(request: LlmRequest[]) {
    this.logger.log(`Parsing ${request.length} visa requirements`);
    const limit = pLimit(5);

    const promises = request.map((req) =>
      limit(async () => {
        let visaRequirement: VisaRequirement;
        if (req.notes) {
          this.logger.debug(`Notes found for ${req.destinationCountryCd}`);
          // Check if the notes are already in the database
          const noteCheck =
            await this.dbService.client.visaRequirement.findUnique({
              where: {
                originCountryCode_destinationCountryCode: {
                  originCountryCode: req.originCountryCd,
                  destinationCountryCode: req.destinationCountryCd,
                },
              },
              include: {
                conditions: true,
              },
            });
          if (noteCheck && noteCheck.notesHash === req.notesHash) {
            this.logger.debug(
              `Notes are the same for ${req.destinationCountryCd}, skipping LLM call`,
            );
            return this.mapPrismaRequirementToApp(noteCheck);
          }

          visaRequirement = await this.sendAiRequest(req);
        } else {
          visaRequirement = this.convertToVisaRequirement(req);
        }
        visaRequirement.notesHash = req.notesHash;
        return visaRequirement;
      }),
    );

    const visaRequirements = await Promise.all(promises);
    this.logger.log(`Processed ${visaRequirements.length} requirements`);

    return visaRequirements;
  }

  private async sendAiRequest(rawText: LlmRequest): Promise<VisaRequirement> {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.debug(
        `Sending AI request for ${rawText.destinationCountryCd} (attempt ${attempt}/${maxAttempts})`,
      );
      const response = await this.openai.responses.create({
        model: "gpt-4.1-nano",
        temperature: 0.1,
        input: [
          { role: "system", content: VISA_PARSING_SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(rawText) },
        ],
        max_output_tokens: 800,
        text: {
          format: VISA_REQUIREMENT_RESPONSE_FORMAT,
        },
      });
      this.logger.debug(
        `AI response received for ${rawText.destinationCountryCd}`,
      );
      try {
        return JSON.parse(response.output_text) as VisaRequirement;
      } catch (error) {
        this.logger.warn(
          `Error parsing AI response for ${rawText.destinationCountryCd} (attempt ${attempt}/${maxAttempts}): ${error} Response ID: ${response.id}`,
        );
        if (attempt === maxAttempts) {
          this.logger.error(
            `All ${maxAttempts} attempts failed for ${rawText.destinationCountryCd}, falling back to convertToVisaRequirement`,
          );
          return this.convertToVisaRequirement(rawText);
        }
      }
    }
    return this.convertToVisaRequirement(rawText);
  }

  private convertToVisaRequirement(request: LlmRequest): VisaRequirement {
    return {
      destinationCountryCd: request.destinationCountryCd,
      originCountryCd: request.originCountryCd,
      primaryRequirement: request.visaType,
      duration: request.duration,
      lastVerified: request.lastVerified,
      sourceUrl: request.sourceUrl,
    };
  }

  /** Map Prisma row (originCountryCode/destinationCountryCode) to app VisaRequirement (originCountryCd/destinationCountryCd). */
  private mapPrismaRequirementToApp(
    row: VisaRequirementResponse,
  ): VisaRequirement {
    const conditions: VisaCondition[] | undefined =
      row.conditions?.length > 0
        ? row.conditions.map((c) => ({
            type: c.type,
            description: c.description,
            acceptedCountries: c.acceptedCountries,
            mustBeValid: c.mustBeValid,
            durationIfMet: c.durationIfMet as VisaCondition["durationIfMet"],
          }))
        : undefined;
    return {
      originCountryCd: row.originCountryCode,
      destinationCountryCd: row.destinationCountryCode,
      primaryRequirement: row.primaryRequirement,
      duration: row.duration as VisaRequirement["duration"],
      sourceUrl: row.sourceUrl ?? undefined,
      lastVerified: row.lastVerified?.toISOString(),
      notesHash: row.notesHash ?? undefined,
      conditions,
    };
  }
}
