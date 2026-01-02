import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateYearPriceDto {
  @ApiProperty({ example: 'uuid', description: 'Variant ID' })
  @IsNotEmpty()
  @IsUUID('4')
  variantId: string;

  @ApiProperty({ example: 2024, description: 'Tahun' })
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  @Max(2030)
  year: number;

  @ApiProperty({ example: 230000000, description: 'Harga dasar' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class YearPriceItemDto {
  @ApiProperty({ example: 2024 })
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  @Max(2030)
  year: number;

  @ApiProperty({ example: 230000000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;
}

export class BulkCreateYearPriceDto {
  @ApiProperty({ example: 'uuid', description: 'Variant ID' })
  @IsNotEmpty()
  @IsUUID('4')
  variantId: string;

  @ApiProperty({ type: [YearPriceItemDto], description: 'List of year prices' })
  @IsNotEmpty()
  prices: YearPriceItemDto[];
}
