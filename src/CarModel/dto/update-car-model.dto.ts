import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCarModelDto {
  @ApiPropertyOptional({
    example: 'Fortuner Updated',
    description: 'Nama model mobil',
  })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiPropertyOptional({
    example: 'SUV premium dari Toyota - Updated',
    description: 'Deskripsi model mobil',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 520000000,
    description: 'Harga dasar model',
  })
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/cars/fortuner-new.jpg',
    description: 'URL gambar model mobil',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Status aktif model',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
