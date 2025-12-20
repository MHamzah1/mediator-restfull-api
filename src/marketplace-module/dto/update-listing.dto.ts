import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateListingDto {
  @ApiPropertyOptional({
    example: 145000000,
    description: 'Harga jual mobil',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Harga harus berupa angka' })
  @Min(1000000, { message: 'Harga minimal Rp 1.000.000' })
  price?: number;

  @ApiPropertyOptional({
    example: 52000,
    description: 'Kilometer mobil',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Kilometer harus berupa angka' })
  @Min(0, { message: 'Kilometer tidak boleh negatif' })
  mileage?: number;

  @ApiPropertyOptional({
    example: 'HARGA TURUN! Mobil terawat, service rutin...',
    description: 'Deskripsi lengkap mobil',
  })
  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa string' })
  @MinLength(50, { message: 'Deskripsi minimal 50 karakter' })
  description?: string;

  @ApiPropertyOptional({
    example: 'Pajak Hidup',
    description: 'Status pajak',
  })
  @IsOptional()
  @IsString({ message: 'Status pajak harus berupa string' })
  taxStatus?: string;

  @ApiPropertyOptional({
    example: [
      'https://cdn.example.com/car1-front-new.jpg',
      'https://cdn.example.com/car1-back.jpg',
    ],
    description: 'Array URL gambar mobil',
  })
  @IsOptional()
  @IsArray({ message: 'Gambar harus berupa array' })
  @ArrayMinSize(1, { message: 'Minimal 1 gambar diperlukan' })
  @ArrayMaxSize(10, { message: 'Maksimal 10 gambar' })
  @IsString({ each: true, message: 'Setiap gambar harus berupa URL string' })
  images?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Status aktif listing',
  })
  @IsOptional()
  @IsBoolean({ message: 'Status aktif harus berupa boolean' })
  isActive?: boolean;
}
