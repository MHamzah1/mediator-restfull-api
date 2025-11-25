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

export class CreateUserDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(32, { message: 'Password maksimal 32 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password harus mengandung huruf kecil, huruf besar dan angka',
  })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @IsPhoneNumber('ID', {
    message: 'Nomor telepon tidak valid (gunakan format Indonesia)',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(['customer', 'admin', 'salesman'], {
    message: 'Role harus customer, admin, atau salesman',
  })
  role: 'customer' | 'admin' | 'salesman';
}
