import { ApiProperty } from "@nestjs/swagger";

export class SummaryItemDto {
  @ApiProperty({ example: "CA" })
  destinationCountryCode!: string;

  @ApiProperty({ example: "VISA_FREE" })
  primaryRequirement!: string;

  @ApiProperty({
    example: { maxStayDays: 180, description: "180 days" },
    nullable: true,
  })
  duration!: unknown;
}
