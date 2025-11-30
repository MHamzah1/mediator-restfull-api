import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUserDto {
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
    description: 'Cari berdasarkan nama atau email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Urutkan berdasarkan field',
    example: 'createdAt',
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'fullName', 'email'],
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'fullName', 'email'])
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Arah pengurutan',
    example: 'DESC',
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortDirection?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Filter berdasarkan role',
    example: 'customer',
    enum: ['customer', 'admin', 'salesman'],
  })
  @IsOptional()
  @IsEnum(['customer', 'admin', 'salesman'])
  role?: 'customer' | 'admin' | 'salesman';

  @ApiPropertyOptional({
    description: 'Tanggal mulai pencarian (format: YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Tanggal akhir pencarian (format: YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter periode waktu',
    example: 'ThisMonth',
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
