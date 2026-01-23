import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export class CalculatePriceDto {
  @ApiProperty({ example: 'uuid', description: 'Variant ID' })
  @IsNotEmpty()
  @IsUUID('4')
  variantId: string;

  @ApiProperty({ example: 2018, description: 'Tahun' })
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  @Max(2030)
  year: number;

  @ApiProperty({ example: 'personal', description: 'Kode kepemilikan' })
  @IsNotEmpty()
  @IsString()
  ownershipCode: string;

  @ApiProperty({ example: 'ice_blue', description: 'Kode warna' })
  @IsNotEmpty()
  @IsString()
  colorCode: string;

  @ApiProperty({ example: 'luxury', description: 'Kode feature' })
  @IsNotEmpty()
  @IsString()
  featureCode: string;

  @ApiProperty({
    example: [],
    description: 'Custom Price IDs (optional)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  customPriceIds?: string[];
}
