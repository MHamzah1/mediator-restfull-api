import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryGetAllDto } from '../../common/query-get-all.dto';

export class QueryYearPriceDto extends QueryGetAllDto {
  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID('4')
  variantId?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID('4')
  modelId?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID('4')
  brandId?: string;

  @ApiProperty({ example: 2024, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

export class QueryYearPriceByVariantDto {
  @ApiProperty({ example: 2020, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  yearFrom?: number;

  @ApiProperty({ example: 2024, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(2030)
  yearTo?: number;
}
