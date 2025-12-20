import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PriceType } from '../../entities/custom-price.entity';

export class CreateCustomPriceDto {
  @ApiProperty({
    description: 'ID dari car model',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  modelId: string;

  @ApiProperty({
    description: 'Nama custom price',
    example: 'Interior Premium',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  priceName: string;

  @ApiProperty({
    description: 'Tipe harga',
    enum: PriceType,
    example: 'addition',
  })
  @IsNotEmpty()
  @IsEnum(PriceType)
  priceType: PriceType;

  @ApiProperty({
    description: 'Nilai harga (untuk percentage, masukkan angka tanpa %)',
    example: 10000000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  priceValue: number;

  @ApiPropertyOptional({
    description: 'Deskripsi custom price',
    example: 'Upgrade interior ke premium',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status aktif',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
