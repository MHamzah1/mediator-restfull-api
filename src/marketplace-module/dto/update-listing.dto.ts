import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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

  // Field ini untuk menerima files dari multipart/form-data
  // Actual file handling dilakukan oleh @UploadedFiles() decorator
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Upload gambar baru (opsional, max 10 files)',
  })
  @IsOptional()
  @Exclude() // Exclude dari transformation karena ditangani oleh multer
  images?: any;

  @ApiPropertyOptional({
    example: true,
    description: 'Status aktif listing',
  })
  @IsOptional()
  @IsBoolean({ message: 'Status aktif harus berupa boolean' })
  isActive?: boolean;
}
