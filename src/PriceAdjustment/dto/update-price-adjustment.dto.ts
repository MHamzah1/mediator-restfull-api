import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { AdjustmentType } from '../../entities/price-adjustment.entity';

export class UpdatePriceAdjustmentDto {
  @ApiProperty({ example: 'Transmisi Manual', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: '#ffffff', required: false })
  @IsOptional()
  @IsString()
  colorHex?: string;

  @ApiProperty({ example: 'fixed', enum: AdjustmentType, required: false })
  @IsOptional()
  @IsEnum(AdjustmentType)
  adjustmentType?: AdjustmentType;

  @ApiProperty({ example: -5000000, required: false })
  @IsOptional()
  @IsNumber()
  adjustmentValue?: number;

  @ApiProperty({ example: 'Description', required: false })
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
