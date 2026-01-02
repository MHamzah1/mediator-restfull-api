import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  AdjustmentCategory,
  AdjustmentType,
} from '../../entities/price-adjustment.entity';

export class CreatePriceAdjustmentDto {
  @ApiProperty({ example: 'uuid', description: 'Car Model ID (WAJIB)' })
  @IsNotEmpty()
  @IsUUID('4')
  modelId: string;

  @ApiProperty({ example: 'transmission', enum: AdjustmentCategory })
  @IsNotEmpty()
  @IsEnum(AdjustmentCategory)
  category: AdjustmentCategory;

  @ApiProperty({ example: 'manual', description: 'Kode adjustment' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Transmisi Manual', description: 'Nama adjustment' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '#ffffff', required: false })
  @ValidateIf((o) => o.category === AdjustmentCategory.COLOR)
  @IsNotEmpty({ message: 'colorHex wajib diisi untuk category color' })
  @IsString()
  colorHex?: string;

  @ApiProperty({ example: 'fixed', enum: AdjustmentType, required: false })
  @IsOptional()
  @IsEnum(AdjustmentType)
  adjustmentType?: AdjustmentType;

  @ApiProperty({ example: -5000000, description: 'Nilai adjustment' })
  @IsNotEmpty()
  @IsNumber()
  adjustmentValue: number;

  @ApiProperty({ example: 'Pengurangan harga untuk transmisi manual', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isBaseline?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BulkAdjustmentItemDto {
  @ApiProperty({ example: 'transmission', enum: AdjustmentCategory })
  @IsNotEmpty()
  @IsEnum(AdjustmentCategory)
  category: AdjustmentCategory;

  @ApiProperty({ example: 'manual' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Transmisi Manual' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '#ffffff', required: false })
  @IsOptional()
  @IsString()
  colorHex?: string;

  @ApiProperty({ example: -5000000 })
  @IsNotEmpty()
  @IsNumber()
  adjustmentValue: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isBaseline?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class BulkCreatePriceAdjustmentDto {
  @ApiProperty({ type: [BulkAdjustmentItemDto] })
  @IsNotEmpty()
  adjustments: BulkAdjustmentItemDto[];
}
