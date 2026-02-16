import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config.service";

import OpenAI from "openai";
import {
  VISA_PARSING_SYSTEM_PROMPT,
  VISA_REQUIREMENT_RESPONSE_FORMAT,
} from "./const/llm.const";

@Injectable()
export class LlmService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get("OPENAI_API_KEY"),
    });
  }

  async parseVisaRequirement(rawText: any) {
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
    return response.output;
  }
}
