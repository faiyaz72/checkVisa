import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";

@Injectable()
export class ScraperAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const token = request.headers["x-api-key"];

    if (!token) {
      throw new UnauthorizedException("Missing or invalid API key");
    }

    if (token !== this.configService.get("SCRAPER_API_KEY")) {
      throw new UnauthorizedException("Invalid API key");
    }
    return true;
  }
}
