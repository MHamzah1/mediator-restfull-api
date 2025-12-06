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
import { CustomPriceService } from './custom-price.service';
import { CreateCustomPriceDto } from './dto/create-custom-price.dto';
import { UpdateCustomPriceDto } from './dto/update-custom-price.dto';
import { QueryCustomPriceDto } from './dto/query-custom-price.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Custom Prices')
@Controller('api')
export class CustomPriceController {
  constructor(private readonly customPriceService: CustomPriceService) {}

  @Get('custom-prices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all custom prices dengan pagination dan filter',
  })
  @ApiResponse({
    status: 200,
    description: 'List custom prices dengan pagination',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            modelId: 'uuid',
            modelName: 'Avanza',
            priceName: 'Warna Custom',
            priceType: 'addition',
            priceValue: 5000000,
            description: 'Biaya custom warna',
            isActive: true,
            createdAt: '2025-01-10T08:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalRecords: 50,
          totalPages: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findAll(@Query() query: QueryCustomPriceDto) {
    return this.customPriceService.findAll(query);
  }

  @Get('car-models/:modelId/custom-prices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get custom prices by model ID' })
  @ApiParam({
    name: 'modelId',
    description: 'Car Model ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List custom prices untuk model tertentu',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            modelId: 'uuid',
            modelName: 'Avanza',
            priceName: 'Warna Custom',
            priceType: 'addition',
            priceValue: 5000000,
            description: 'Biaya custom warna',
            isActive: true,
            createdAt: '2025-01-10T08:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalRecords: 50,
          totalPages: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Model mobil tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findByModelId(
    @Param('modelId') modelId: string,
    @Query() query: QueryCustomPriceDto,
  ) {
    return this.customPriceService.findByModelId(modelId, query);
  }

  @Get('custom-prices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get custom price by ID' })
  @ApiParam({
    name: 'id',
    description: 'Custom Price ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail custom price',
    schema: {
      example: {
        id: 'uuid',
        modelId: 'uuid',
        modelName: 'Avanza',
        priceName: 'Warna Custom',
        priceType: 'addition',
        priceValue: 5000000,
        description: 'Biaya custom warna',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Custom price tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findOne(@Param('id') id: string) {
    return this.customPriceService.findOne(id);
  }

  @Post('custom-prices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create custom price baru (Admin Only)' })
  @ApiBody({ type: CreateCustomPriceDto })
  @ApiResponse({
    status: 201,
    description: 'Custom price berhasil dibuat',
    schema: {
      example: {
        id: 'uuid',
        modelId: 'uuid',
        priceName: 'Interior Premium',
        priceType: 'addition',
        priceValue: 10000000,
        description: 'Upgrade interior ke premium',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Model mobil tidak ditemukan' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async create(@Body() createCustomPriceDto: CreateCustomPriceDto) {
    return this.customPriceService.create(createCustomPriceDto);
  }

  @Put('custom-prices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update custom price by ID (Admin Only)' })
  @ApiParam({
    name: 'id',
    description: 'Custom Price ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateCustomPriceDto })
  @ApiResponse({
    status: 200,
    description: 'Custom price berhasil diupdate',
    schema: {
      example: {
        id: 'uuid',
        modelId: 'uuid',
        priceName: 'Interior Premium Updated',
        priceType: 'addition',
        priceValue: 12000000,
        description: 'Upgrade interior ke premium - Updated',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Custom price tidak ditemukan' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomPriceDto: UpdateCustomPriceDto,
  ) {
    return this.customPriceService.update(id, updateCustomPriceDto);
  }

  @Delete('custom-prices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete custom price by ID (Admin Only)' })
  @ApiParam({
    name: 'id',
    description: 'Custom Price ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Custom price berhasil dihapus (No Content)',
  })
  @ApiResponse({ status: 404, description: 'Custom price tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async remove(@Param('id') id: string) {
    await this.customPriceService.remove(id);
  }
}
