import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCarModelDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Brand ID',
  })
  @IsNotEmpty()
  @IsUUID()
  brandId: string;

  @ApiProperty({
    example: 'Fortuner',
    description: 'Nama model mobil',
  })
  @IsNotEmpty()
  @IsString()
  modelName: string;

  @ApiPropertyOptional({
    example: 'SUV premium dari Toyota',
    description: 'Deskripsi model mobil',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 500000000,
    description: 'Harga dasar model',
  })
  @IsNotEmpty()
  @IsNumber()
  basePrice: number;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/cars/fortuner.jpg',
    description: 'URL gambar model mobil',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Status aktif model',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
