import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { Type as NestType } from "@nestjs/common";

export class PaginatedRequest {
  @ApiPropertyOptional({
    description: "Page number (1-indexed)",
    default: 1,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    default: 10,
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;
}

export class PaginatedResponse<T> {
  data!: T[];
  page!: number;
  pageSize!: number;
  total!: number;
}

export function PaginatedResponseDto<TModel extends NestType<unknown>>(
  ItemClass: TModel,
) {
  class PaginatedResponseHost {
    @ApiProperty({ type: [ItemClass] })
    data!: InstanceType<TModel>[];

    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 10 })
    pageSize!: number;

    @ApiProperty({ example: 0 })
    total!: number;
  }

  Object.defineProperty(PaginatedResponseHost, "name", {
    value: `PaginatedResponseOf${ItemClass.name}`,
  });

  return PaginatedResponseHost;
}
