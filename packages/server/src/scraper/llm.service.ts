import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { LoggerService } from "../logger/logger.service";
import OpenAI from "openai";
import {
  VISA_PARSING_SYSTEM_PROMPT,
  VISA_REQUIREMENT_RESPONSE_FORMAT,
} from "./const/llm.const";
import { LlmRequest, VisaRequirement } from "./type/VisaInterface";
import pLimit from "p-limit";

@Injectable()
export class LlmService {
  private readonly logger = new LoggerService(LlmService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get("OPENAI_API_KEY"),
    });
  }

  async parseVisaRequirement(request: LlmRequest[]) {
    this.logger.log(`Parsing ${request.length} visa requirements`);
    const limit = pLimit(10);

    const promises = request.map((req) =>
      limit(async () => {
        let visaRequirement: VisaRequirement;
        if (req.notes) {
          this.logger.debug(`Notes found for ${req.destinationCountryCd}`);
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
}
