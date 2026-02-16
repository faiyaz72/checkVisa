import { Injectable } from "@nestjs/common";
import "dotenv/config";

@Injectable()
export class ConfigService {
  get(key: string): string {
    if (!process.env[key]) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return process.env[key] as string;
  }
}
