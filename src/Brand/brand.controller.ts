import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { QueryGetAllDto } from '../common/query-get-all.dto';

@ApiTags('Brand')
@Controller('api/brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all brands dengan pagination dan filter' })
  @ApiResponse({
    status: 200,
    description: 'List brands dengan pagination',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Toyota',
            description: 'Manufacturer dari Jepang',
            logo: 'https://cdn.example.com/logo/toyota.png',
            isActive: true,
            createdAt: '2025-01-10T08:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z',
          },
          {
            id: 'uuid',
            name: 'Honda',
            description: 'Manufacturer dari Jepang',
            logo: 'https://cdn.example.com/logo/honda.png',
            isActive: true,
            createdAt: '2025-01-10T08:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalRecords: 25,
          totalPages: 3,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findAll(@Query() query: QueryGetAllDto) {
    return this.brandService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buat brand baru' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({
    status: 201,
    description: 'Brand berhasil dibuat',
    schema: {
      example: {
        id: 'uuid',
        name: 'Toyota',
        description: 'Manufacturer dari Jepang',
        logo: 'https://cdn.example.com/logo/toyota.png',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Nama brand sudah terdaftar' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get('paged')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get brands dengan pagination dan filter lengkap' })
  @ApiResponse({
    status: 200,
    description: 'List brands dengan pagination dan filter',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Toyota',
            description: 'Manufacturer dari Jepang',
            logo: 'https://cdn.example.com/logo/toyota.png',
            isActive: true,
            createdAt: '2025-01-10T08:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalRecords: 25,
          totalPages: 3,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findPaged(@Query() query: QueryGetAllDto) {
    return this.brandService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiParam({
    name: 'id',
    description: 'Brand ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail brand',
    schema: {
      example: {
        id: 'uuid',
        name: 'Toyota',
        description: 'Manufacturer dari Jepang',
        logo: 'https://cdn.example.com/logo/toyota.png',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Brand tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update brand by ID' })
  @ApiParam({
    name: 'id',
    description: 'Brand ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({
    status: 200,
    description: 'Brand berhasil diupdate',
    schema: {
      example: {
        id: 'uuid',
        name: 'Toyota',
        description: 'Manufacturer dari Jepang - Updated',
        logo: 'https://cdn.example.com/logo/toyota.png',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Brand tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Nama brand sudah digunakan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete brand by ID' })
  @ApiParam({
    name: 'id',
    description: 'Brand ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand berhasil dihapus',
    schema: {
      example: {
        message: 'Brand berhasil dihapus',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Brand tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async remove(@Param('id') id: string) {
    await this.brandService.remove(id);
    return { message: 'Brand berhasil dihapus' };
  }
}
