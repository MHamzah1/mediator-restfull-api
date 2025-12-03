import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandDto {
  @ApiPropertyOptional({
    example: 'Toyota',
    description: 'Nama brand',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nama brand maksimal 100 karakter' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Manufacturer dari Jepang',
    description: 'Deskripsi brand',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/logo/toyota.png',
    description: 'URL logo brand',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Format URL logo tidak valid' })
  logo?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Status aktif brand',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
