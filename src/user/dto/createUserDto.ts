import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsString,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email pengguna',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    example: 'Password123',
    description:
      'Password minimal 8 karakter, mengandung huruf besar, kecil, dan angka',
    minLength: 8,
    maxLength: 32,
  })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(32, { message: 'Password maksimal 32 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password harus mengandung huruf kecil, huruf besar dan angka',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Nama lengkap pengguna',
  })
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '+628123456789',
    description: 'Nomor telepon dengan format Indonesia',
  })
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @IsPhoneNumber('ID', {
    message: 'Nomor telepon tidak valid (gunakan format Indonesia)',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'customer',
    description: 'Role pengguna',
    enum: ['customer', 'admin', 'salesman'],
  })
  @IsNotEmpty()
  @IsEnum(['customer', 'admin', 'salesman'], {
    message: 'Role harus customer, admin, atau salesman',
  })
  role: 'customer' | 'admin' | 'salesman';
}
