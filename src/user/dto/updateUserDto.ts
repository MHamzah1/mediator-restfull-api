// src/user/dto/updateUserDto.ts

import {
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsString,
  IsPhoneNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Email pengguna',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional({
    example: 'Password123',
    description:
      'Password minimal 8 karakter, mengandung huruf besar, kecil, dan angka',
    minLength: 8,
    maxLength: 32,
  })
  @IsOptional()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(32, { message: 'Password maksimal 32 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password harus mengandung huruf kecil, huruf besar dan angka',
  })
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Nama lengkap pengguna',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: '+628123456789',
    description: 'Nomor telepon dengan format Indonesia',
  })
  @IsOptional()
  @IsPhoneNumber('ID', {
    message: 'Nomor telepon tidak valid (gunakan format Indonesia)',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: '6281234567890',
    description: 'Nomor WhatsApp untuk marketplace (format: 628xxx)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^628\d{8,13}$/, {
    message: 'Format nomor WhatsApp tidak valid (harus 628xxxxxxxxx)',
  })
  whatsappNumber?: string;

  @ApiPropertyOptional({
    example: 'Jakarta Selatan',
    description: 'Lokasi user untuk marketplace',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'customer',
    description: 'Role pengguna',
    enum: ['customer', 'admin', 'salesman'],
  })
  @IsOptional()
  @IsEnum(['customer', 'admin', 'salesman'], {
    message: 'Role harus customer, admin, atau salesman',
  })
  role?: 'customer' | 'admin' | 'salesman';
}
