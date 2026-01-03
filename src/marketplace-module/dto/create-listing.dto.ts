import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
  MinLength,
  Matches,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Exclude } from 'class-transformer';

export class CreateListingDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Car Model ID',
  })
  @IsNotEmpty({ message: 'Car Model ID tidak boleh kosong' })
  @IsUUID('4', { message: 'Car Model ID harus berformat UUID' })
  carModelId: string;

  @ApiProperty({
    example: 2020,
    description: 'Tahun produksi mobil (1990-2025)',
  })
  @IsNotEmpty({ message: 'Tahun tidak boleh kosong' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Tahun harus berupa angka' })
  @Min(1990, { message: 'Tahun minimal 1990' })
  @Max(2025, { message: 'Tahun maksimal 2025' })
  year: number;

  @ApiProperty({
    example: 150000000,
    description: 'Harga jual mobil (minimal 1 juta)',
  })
  @IsNotEmpty({ message: 'Harga tidak boleh kosong' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Harga harus berupa angka' })
  @Min(1000000, { message: 'Harga minimal Rp 1.000.000' })
  price: number;

  @ApiProperty({
    example: 50000,
    description: 'Kilometer mobil',
  })
  @IsNotEmpty({ message: 'Kilometer tidak boleh kosong' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Kilometer harus berupa angka' })
  @Min(0, { message: 'Kilometer tidak boleh negatif' })
  mileage: number;

  @ApiProperty({
    example: 'automatic',
    description: 'Jenis transmisi (manual/automatic)',
  })
  @IsNotEmpty({ message: 'Transmisi tidak boleh kosong' })
  @IsString({ message: 'Transmisi harus berupa string' })
  transmission: string;

  @ApiProperty({
    example: 'bensin',
    description: 'Jenis bahan bakar (bensin/diesel/hybrid/electric)',
  })
  @IsNotEmpty({ message: 'Jenis bahan bakar tidak boleh kosong' })
  @IsString({ message: 'Jenis bahan bakar harus berupa string' })
  fuelType: string;

  @ApiProperty({
    example: 'Hitam Metalik',
    description: 'Warna mobil',
  })
  @IsNotEmpty({ message: 'Warna tidak boleh kosong' })
  @IsString({ message: 'Warna harus berupa string' })
  color: string;

  @ApiProperty({
    example: 'Jakarta Selatan',
    description: 'Kota lokasi mobil',
  })
  @IsNotEmpty({ message: 'Kota tidak boleh kosong' })
  @IsString({ message: 'Kota harus berupa string' })
  locationCity: string;

  @ApiProperty({
    example: 'DKI Jakarta',
    description: 'Provinsi lokasi mobil',
  })
  @IsNotEmpty({ message: 'Provinsi tidak boleh kosong' })
  @IsString({ message: 'Provinsi harus berupa string' })
  locationProvince: string;

  @ApiProperty({
    example: 'Mobil terawat, service rutin di dealer resmi. Kondisi istimewa.',
    description: 'Deskripsi lengkap mobil (minimal 50 karakter)',
  })
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  @IsString({ message: 'Deskripsi harus berupa string' })
  @MinLength(50, { message: 'Deskripsi minimal 50 karakter' })
  description: string;

  @ApiPropertyOptional({
    example: 'bekas',
    description: 'Kondisi mobil (baru/bekas)',
    default: 'bekas',
  })
  @IsOptional()
  @IsString({ message: 'Kondisi harus berupa string' })
  condition?: string;

  @ApiPropertyOptional({
    example: 'Tangan Pertama',
    description: 'Status kepemilikan',
  })
  @IsOptional()
  @IsString({ message: 'Status kepemilikan harus berupa string' })
  ownershipStatus?: string;

  @ApiPropertyOptional({
    example: 'Pajak Hidup',
    description: 'Status pajak',
  })
  @IsOptional()
  @IsString({ message: 'Status pajak harus berupa string' })
  taxStatus?: string;

  @ApiProperty({
    example: '6281234567890',
    description: 'Nomor WhatsApp seller (format: 628xxx)',
  })
  @IsNotEmpty({ message: 'Nomor WhatsApp tidak boleh kosong' })
  @IsString({ message: 'Nomor WhatsApp harus berupa string' })
  @Matches(/^628\d{8,13}$/, {
    message: 'Format nomor WhatsApp tidak valid (harus 628xxxxxxxxx)',
  })
  sellerWhatsapp: string;

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
