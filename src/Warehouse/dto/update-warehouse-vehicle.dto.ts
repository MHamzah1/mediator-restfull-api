import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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

  @ApiPropertyOptional({
    example: '6281234567890',
    description: 'Nomor WhatsApp seller (format: 628xxx)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^628\d{8,13}$/, {
    message: 'Format nomor WhatsApp tidak valid (harus 628xxxxxxxxx)',
  })
  sellerWhatsapp?: string;

  @ApiPropertyOptional({ example: '3273012345678901' })
  @IsOptional()
  @IsString()
  sellerKtp?: string;

  // ── Marketplace listing fields ─────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 'Mobil terawat, service rutin di dealer resmi. Kondisi istimewa.',
    description: 'Deskripsi lengkap mobil (minimal 50 karakter)',
  })
  @IsOptional()
  @IsString()
  @MinLength(50, { message: 'Deskripsi minimal 50 karakter' })
  description?: string;

  @ApiPropertyOptional({
    example: 'bekas',
    description: 'Kondisi mobil (baru/bekas)',
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    example: 'Tangan Pertama',
    description: 'Status kepemilikan',
  })
  @IsOptional()
  @IsString()
  ownershipStatus?: string;

  @ApiPropertyOptional({
    example: 'Pajak Hidup',
    description: 'Status pajak',
  })
  @IsOptional()
  @IsString()
  taxStatus?: string;

  @ApiPropertyOptional({
    example: 'Jakarta Selatan',
    description: 'Kota lokasi mobil',
  })
  @IsOptional()
  @IsString()
  locationCity?: string;

  @ApiPropertyOptional({
    example: 'DKI Jakarta',
    description: 'Provinsi lokasi mobil',
  })
  @IsOptional()
  @IsString()
  locationProvince?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  // Field ini untuk menerima files dari multipart/form-data
  // Actual file handling dilakukan oleh @UploadedFiles() decorator
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Upload 1-10 gambar mobil (max 5MB per file)',
  })
  @IsOptional()
  @Exclude() // Exclude dari transformation karena ditangani oleh multer
  images?: any;
}
