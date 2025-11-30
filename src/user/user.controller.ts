import { Controller, Get, UseGuards, Body, Post, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register user baru' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User berhasil dibuat',
    schema: {
      example: {
        message: 'User berhasil dibuat',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  async create(@Body() dto: CreateUserDto) {
    await this.usersService.create(dto);
    return { message: 'User berhasil dibuat' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get profil user yang sedang login' })
  @ApiResponse({
    status: 200,
    description: 'Data profil user',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        fullName: 'John Doe',
        phoneNumber: '+628123456789',
        role: 'customer',
        createdAt: '2025-11-30T00:00:00.000Z',
        updatedAt: '2025-11-30T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async getProfile(@Req() req) {
    const userId = req.user.id;
    const user = await this.usersService.findOne(userId);
    return user;
  }
}
