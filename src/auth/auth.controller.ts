import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/createUserDto';
import { UsersService } from '../user/user.service';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user baru untuk marketplace' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User berhasil didaftarkan',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'seller@example.com',
        fullName: 'John Doe',
        phoneNumber: '081234567890',
        whatsappNumber: '6281234567890',
        location: 'Jakarta Selatan',
        role: 'customer',
        createdAt: '2025-12-21T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      whatsappNumber: user.whatsappNumber,
      location: user.location,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login pengguna' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600,
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'seller@example.com',
          fullName: 'John Doe',
          role: 'customer',
          whatsappNumber: '6281234567890',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }
}
