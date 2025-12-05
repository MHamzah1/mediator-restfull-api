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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CarModelService } from './car-model.service';
import { CreateCarModelDto } from './dto/create-car-model.dto';
import { UpdateCarModelDto } from './dto/update-car-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { QueryGetAllDto } from '../common/query-get-all.dto';

@ApiTags('Car Models')
@Controller('api/car-models')
export class CarModelController {
  constructor(private readonly carModelService: CarModelService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all car models dengan pagination dan filter' })
  @ApiResponse({
    status: 200,
    description: 'List car models dengan pagination',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            brandId: 'uuid',
            modelName: 'Fortuner',
            description: 'SUV premium dari Toyota',
            basePrice: 500000000,
            imageUrl: 'https://cdn.example.com/cars/fortuner.jpg',
            isActive: true,
            createdAt: '2025-01-10T08:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z',
            brand: {
              id: 'uuid',
              name: 'Toyota',
              logo: 'https://cdn.example.com/logo/toyota.png',
            },
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
    return this.carModelService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get car model by ID' })
  @ApiParam({
    name: 'id',
    description: 'Car Model ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail car model',
    schema: {
      example: {
        id: 'uuid',
        brandId: 'uuid',
        modelName: 'Fortuner',
        description: 'SUV premium dari Toyota',
        basePrice: 500000000,
        imageUrl: 'https://cdn.example.com/cars/fortuner.jpg',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
        brand: {
          id: 'uuid',
          name: 'Toyota',
          logo: 'https://cdn.example.com/logo/toyota.png',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Model mobil tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findOne(@Param('id') id: string) {
    return this.carModelService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create car model baru (Admin Only)' })
  @ApiBody({ type: CreateCarModelDto })
  @ApiResponse({
    status: 201,
    description: 'Car model berhasil dibuat',
    schema: {
      example: {
        id: 'uuid',
        brandId: 'uuid',
        modelName: 'Fortuner',
        description: 'SUV premium dari Toyota',
        basePrice: 500000000,
        imageUrl: 'https://cdn.example.com/cars/fortuner.jpg',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Brand tidak ditemukan' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async create(@Body() createCarModelDto: CreateCarModelDto) {
    return this.carModelService.create(createCarModelDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update car model by ID (Admin Only)' })
  @ApiParam({
    name: 'id',
    description: 'Car Model ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateCarModelDto })
  @ApiResponse({
    status: 200,
    description: 'Car model berhasil diupdate',
    schema: {
      example: {
        id: 'uuid',
        brandId: 'uuid',
        modelName: 'Fortuner Updated',
        description: 'SUV premium dari Toyota - Updated',
        basePrice: 520000000,
        imageUrl: 'https://cdn.example.com/cars/fortuner-new.jpg',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Model mobil tidak ditemukan' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async update(
    @Param('id') id: string,
    @Body() updateCarModelDto: UpdateCarModelDto,
  ) {
    return this.carModelService.update(id, updateCarModelDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete car model by ID (Admin Only)' })
  @ApiParam({
    name: 'id',
    description: 'Car Model ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Car model berhasil dihapus (No Content)',
  })
  @ApiResponse({ status: 404, description: 'Model mobil tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async remove(@Param('id') id: string) {
    await this.carModelService.remove(id);
  }
}
