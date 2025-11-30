import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email pengguna',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Password pengguna',
  })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password: string;
}
