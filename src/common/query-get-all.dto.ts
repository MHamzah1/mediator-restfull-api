import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryGetAllDto {
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
    example: 10,
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number = 10;

  @ApiPropertyOptional({
    description: 'Cari berdasarkan nama brand',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Urutkan berdasarkan field',
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'name'],
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'name'])
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
}
