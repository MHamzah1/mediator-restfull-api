import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWarehouseVehicleDto {
  // ── Referensi katalog (dari tabel variants & year_prices) ─────────────────
  @ApiPropertyOptional({
    description:
      'ID variant dari tabel variants (update brand, model, transmisi)',
    example: 'uuid-variant',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    description:
      'ID year price dari tabel year_prices (update tahun & harga pasar)',
    example: 'uuid-year-price',
  })
  @IsOptional()
  @IsString()
  yearPriceId?: string;

  // ── Data fisik kendaraan ───────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Putih' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'B 1234 ABC' })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiPropertyOptional({ example: 'MHKA6GJ3J1J012345' })
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiPropertyOptional({ example: '2NR-U123456' })
  @IsOptional()
  @IsString()
  engineNumber?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  mileage?: number;

  @ApiPropertyOptional({ example: 'bensin' })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({
    example: 215000000,
    description: 'Harga penawaran penjual (bukan harga pasar)',
  })
  @IsOptional()
  @IsNumber()
  askingPrice?: number;

  // ── Data penjual ───────────────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  sellerName?: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  sellerPhone?: string;

  @ApiPropertyOptional({ example: '3273012345678901' })
  @IsOptional()
  @IsString()
  sellerKtp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
