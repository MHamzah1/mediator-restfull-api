// src/user/users.controller.ts

import { Controller, Get, UseGuards, Body, Post, Req } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from 'src/dtos/createUserDto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async create(@Body() dto: CreateUserDto) {
    await this.usersService.create(dto);
    return { message: 'User berhasil dibuat' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.id; // Ambil ID dari payload JWT
    const user = await this.usersService.findOne(userId); // Cari user berdasarkan ID
    return user; // Return user tanpa struktur sirkular
  }
}
