// src/user/users.controller.ts

import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Query,
  Body,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from 'src/common/jwt-auth-guard';
import { User } from 'src/entities/user.entity';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll(Number(page), Number(limit));
  }

  //   @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: Partial<User>) {
    await this.usersService.create(dto);
    return { message: 'User berhasil dibuat' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: Partial<User>) {
    return this.usersService.update(id, payload);
  }
}
