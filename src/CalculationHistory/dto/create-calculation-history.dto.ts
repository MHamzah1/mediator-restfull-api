import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateCalculationHistoryDto {
  @ApiProperty({ example: 'uuid', description: 'Variant ID' })
  @IsNotEmpty()
  @IsUUID('4')
  variantId: string;

  @ApiProperty({ example: 2018 })
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  @Max(2030)
  year: number;

  @ApiProperty({ example: 'matic' })
  @IsNotEmpty()
  @IsString()
  transmissionCode: string;

  @ApiProperty({ example: 'personal' })
  @IsNotEmpty()
  @IsString()
  ownershipCode: string;

  @ApiProperty({ example: 'hitam' })
  @IsNotEmpty()
  @IsString()
  colorCode: string;

  @ApiProperty({ example: 135000000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  finalPrice: number;

  @ApiProperty({ example: 'Untuk referensi', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
