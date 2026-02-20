import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
