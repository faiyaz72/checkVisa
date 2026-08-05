import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaginatedRequest } from "../../lib/pagination";

export class DataRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "The origin country code", example: "US" })
  originCountryCode!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "The destination country code", example: "CA" })
  destinationCountryCode!: string;
}

export class SummaryRequest extends PaginatedRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "The origin passport country code",
    example: "US",
  })
  originPassportCountryCode!: string;
}
