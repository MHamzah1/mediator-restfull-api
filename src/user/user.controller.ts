import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  // ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';
import { UpdateUserDto } from './dto/updateUserDto';
import { QueryUserDto } from './dto/queryUserDto';
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users dengan pagination dan filter' })
  @ApiResponse({
    status: 200,
    description: 'List users dengan pagination',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            fullName: 'John Doe',
            phoneNumber: '+628123456789',
            role: 'customer',
            createdAt: '2025-11-30T00:00:00.000Z',
            updatedAt: '2025-11-30T00:00:00.000Z',
          },
        ],
        total: 100,
        page: 1,
        perPage: 10,
        lastPage: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get('paged')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get users dengan pagination dan filter lengkap' })
  @ApiResponse({
    status: 200,
    description: 'List users dengan pagination dan filter',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            fullName: 'John Doe',
            phoneNumber: '+628123456789',
            role: 'customer',
            createdAt: '2025-11-30T00:00:00.000Z',
            updatedAt: '2025-11-30T00:00:00.000Z',
          },
        ],
        total: 100,
        page: 1,
        perPage: 10,
        lastPage: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findPaged(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail user',
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
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User berhasil diupdate',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        fullName: 'John Doe Updated',
        phoneNumber: '+628123456789',
        role: 'customer',
        createdAt: '2025-11-30T00:00:00.000Z',
        updatedAt: '2025-11-30T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User berhasil dihapus',
    schema: {
      example: {
        message: 'User berhasil dihapus',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User berhasil dihapus' };
  }
}
