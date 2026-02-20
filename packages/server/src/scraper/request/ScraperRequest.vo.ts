import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ScraperRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "The country code to scrape",
    example: "US",
    required: true,
  })
  countryCd!: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: "Whether to save the scraped data to a file",
    default: false,
    required: false,
  })
  saveToFile: boolean = false;

  @IsBoolean()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: "Whether to save the scraped data to the database",
    default: true,
    required: false,
  })
  saveToDb: boolean = true;
}

export class RecoverScrapedDataFromFileRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "The country code to recover scraped data from",
    example: "US",
    required: true,
  })
  countryCd!: string;
}
