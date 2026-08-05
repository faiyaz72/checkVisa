import { ApiProperty } from "@nestjs/swagger";

export class SummaryItemDto {
  @ApiProperty({ example: "1234567890" })
  id!: string;

  @ApiProperty({ example: "CA" })
  originCountryCode!: string;

  @ApiProperty({ example: "CA" })
  destinationCountryCode!: string;

  @ApiProperty({ example: "VISA_FREE" })
  primaryRequirement!: string;
}
