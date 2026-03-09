import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseVehicleDto {
  // ── Referensi showroom ─────────────────────────────────────────────────────
  @ApiProperty({ description: 'ID showroom tujuan' })
  @IsNotEmpty()
  @IsString()
  showroomId: string;

  // ── Referensi katalog kendaraan (dari tabel variants & year_prices) ────────
  @ApiProperty({
    description:
      'ID variant dari tabel variants (menentukan brand, model, transmisi)',
    example: 'uuid-variant',
  })
  @IsNotEmpty()
  @IsString()
  variantId: string;

  @ApiProperty({
    description:
      'ID year price dari tabel year_prices (menentukan tahun & harga pasar)',
    example: 'uuid-year-price',
  })
  @IsNotEmpty()
  @IsString()
  yearPriceId: string;

  // ── Data fisik kendaraan ───────────────────────────────────────────────────
  @ApiProperty({ example: 'Hitam' })
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty({ example: 'B 1234 ABC' })
  @IsNotEmpty()
  @IsString()
  licensePlate: string;

  @ApiProperty({ example: 'MHKA6GJ3J1J012345' })
  @IsNotEmpty()
  @IsString()
  chassisNumber: string;

  @ApiProperty({ example: '2NR-U123456' })
  @IsNotEmpty()
  @IsString()
  engineNumber: string;

  @ApiProperty({ example: 45000 })
  @IsNotEmpty()
  @IsNumber()
  mileage: number;

  @ApiProperty({ example: 'bensin' })
  @IsNotEmpty()
  @IsString()
  fuelType: string;

  @ApiProperty({
    example: 230000000,
    description: 'Harga penawaran penjual (bukan harga pasar)',
  })
  @IsNotEmpty()
  @IsNumber()
  askingPrice: number;

  // ── Data penjual ───────────────────────────────────────────────────────────
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  sellerName: string;

  @ApiProperty({ example: '081234567890' })
  @IsNotEmpty()
  @IsString()
  sellerPhone: string;

  @ApiPropertyOptional({ example: '3273012345678901' })
  @IsOptional()
  @IsString()
  sellerKtp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
