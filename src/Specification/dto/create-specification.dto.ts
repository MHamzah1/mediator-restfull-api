import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpecCategory } from '../../entities/specification.entity';

export class CreateSpecificationDto {
  @ApiProperty({
    description: 'ID dari car model',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  modelId: string;

  @ApiProperty({
    description: 'Nama spesifikasi',
    example: 'Engine',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  specName: string;

  @ApiProperty({
    description: 'Kategori spesifikasi',
    enum: SpecCategory,
    example: 'engine',
  })
  @IsNotEmpty()
  @IsEnum(SpecCategory)
  specCategory: SpecCategory;

  @ApiProperty({
    description: 'Nilai spesifikasi',
    example: '1500cc',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  specValue: string;

  @ApiPropertyOptional({
    description: 'Unit dari spesifikasi',
    example: 'cc',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  specUnit?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi spesifikasi',
    example: 'Engine displacement',
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
