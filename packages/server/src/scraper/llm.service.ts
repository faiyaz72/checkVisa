import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { LoggerService } from "../logger/logger.service";
import OpenAI from "openai";
import {
  VISA_PARSING_SYSTEM_PROMPT,
  VISA_REQUIREMENT_RESPONSE_FORMAT,
} from "./const/llm.const";
import { LlmRequest, VisaRequirement } from "./type/VisaInterface";

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
    const visaRequirements: VisaRequirement[] = [];
    this.logger.log(`Parsing ${request.length} visa requirements`);

    const maxAiRequests = 2;
    let aiRequests = 0;

    for (const req of request) {
      if (req.notes) {
        this.logger.debug(`Notes found for ${req.destinationCountryCd}`);
        if (aiRequests >= maxAiRequests) {
          this.logger.debug(
            `Max AI requests reached, skipping ${req.destinationCountryCd}`,
          );
          continue;
        }
        const visaRequirement = await this.sendAiRequest(req);
        visaRequirements.push(visaRequirement);
        aiRequests++;
      } else {
        visaRequirements.push(this.convertToVisaRequirement(req));
      }
    }
    return visaRequirements;
  }

  private async sendAiRequest(rawText: LlmRequest) {
    const response = await this.openai.responses.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      input: [
        { role: "system", content: VISA_PARSING_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(rawText) },
      ],
      text: {
        format: VISA_REQUIREMENT_RESPONSE_FORMAT,
      },
    });
    return JSON.parse(response.output_text) as VisaRequirement;
  }

  private convertToVisaRequirement(request: LlmRequest): VisaRequirement {
    return {
      destinationCountryCd: request.destinationCountryCd,
      originCountryCd: request.originCountryCd,
      primaryRequirement: request.visaType,
      duration: request.duration,
      lastVerified: request.lastVerified,
      sourceUrl: request.sourceUrl,
      confidence: "high",
    };
  }
}
