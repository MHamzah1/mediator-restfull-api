import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterListingDto {
  @ApiPropertyOptional({
    description: 'Halaman yang ingin ditampilkan',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    example: 20,
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number = 20;

  @ApiPropertyOptional({
    description: 'Cari berdasarkan nama brand, model, atau deskripsi',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Urutkan berdasarkan field',
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'price', 'year', 'mileage'],
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'price', 'year', 'mileage'])
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Arah pengurutan',
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortDirection?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status aktif',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan Brand ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  brandId?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan Car Model ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  carModelId?: string;

  @ApiPropertyOptional({
    description: 'Harga minimal',
    example: 100000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Harga maksimal',
    example: 200000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Tahun minimal',
    example: 2018,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMin?: number;

  @ApiPropertyOptional({
    description: 'Tahun maksimal',
    example: 2023,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMax?: number;

  @ApiPropertyOptional({
    description: 'Jenis transmisi',
    example: 'automatic',
  })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional({
    description: 'Jenis bahan bakar',
    example: 'bensin',
  })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({
    description: 'Kota lokasi',
    example: 'Jakarta',
  })
  @IsOptional()
  @IsString()
  locationCity?: string;

  @ApiPropertyOptional({
    description: 'Provinsi lokasi',
    example: 'DKI Jakarta',
  })
  @IsOptional()
  @IsString()
  locationProvince?: string;

  @ApiPropertyOptional({
    description: 'Kondisi mobil',
    example: 'bekas',
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    description: 'Tanggal mulai pencarian (format: YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Tanggal akhir pencarian (format: YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter periode waktu',
    enum: [
      'Today',
      'ThisWeek',
      'LastWeek',
      'ThisMonth',
      'LastMonth',
      'ThisYear',
      'LastYear',
      'Last3Months',
      'Last6Months',
    ],
  })
  @IsOptional()
  @IsEnum([
    'Today',
    'ThisWeek',
    'LastWeek',
    'ThisMonth',
    'LastMonth',
    'ThisYear',
    'LastYear',
    'Last3Months',
    'Last6Months',
  ])
  periode?: string;

  @ApiPropertyOptional({
    description: 'Sorting preset',
    enum: ['price_asc', 'price_desc', 'newest', 'oldest', 'mileage'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;
}
