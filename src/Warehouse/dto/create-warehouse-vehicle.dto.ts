import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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
    default: 'bekas',
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
