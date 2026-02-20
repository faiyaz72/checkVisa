import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ScraperRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "The country code to scrape" })
  countryCd!: string;
}
