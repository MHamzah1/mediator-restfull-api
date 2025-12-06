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
import { SpecificationService } from './specification.service';
import { CreateSpecificationDto } from './dto/create-specification.dto';
import { UpdateSpecificationDto } from './dto/update-specification.dto';
import { QuerySpecificationDto } from './dto/query-specification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Specifications')
@Controller('api/specifications')
export class SpecificationController {
  constructor(private readonly specificationService: SpecificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all specifications dengan pagination dan filter',
  })
  @ApiResponse({
    status: 200,
    description: 'List specifications dengan pagination',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            modelId: 'uuid',
            modelName: 'Avanza',
            specName: 'Engine',
            specCategory: 'engine',
            specValue: '1500cc',
            specUnit: 'cc',
            description: 'Engine displacement',
            isActive: true,
            createdAt: '2025-01-10T08:00:00Z',
            updatedAt: '2025-01-15T10:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalRecords: 100,
          totalPages: 10,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findAll(@Query() query: QuerySpecificationDto) {
    return this.specificationService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get specification by ID' })
  @ApiParam({
    name: 'id',
    description: 'Specification ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail specification',
    schema: {
      example: {
        id: 'uuid',
        modelId: 'uuid',
        specName: 'Engine',
        specCategory: 'engine',
        specValue: '1500cc',
        specUnit: 'cc',
        description: 'Engine displacement',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
        carModel: {
          id: 'uuid',
          modelName: 'Avanza',
          brandId: 'uuid',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Spesifikasi tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async findOne(@Param('id') id: string) {
    return this.specificationService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create specification baru (Admin Only)' })
  @ApiBody({ type: CreateSpecificationDto })
  @ApiResponse({
    status: 201,
    description: 'Specification berhasil dibuat',
    schema: {
      example: {
        id: 'uuid',
        modelId: 'uuid',
        specName: 'Engine',
        specCategory: 'engine',
        specValue: '1500cc',
        specUnit: 'cc',
        description: 'Engine displacement',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Model mobil tidak ditemukan' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async create(@Body() createSpecificationDto: CreateSpecificationDto) {
    return this.specificationService.create(createSpecificationDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update specification by ID (Admin Only)' })
  @ApiParam({
    name: 'id',
    description: 'Specification ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateSpecificationDto })
  @ApiResponse({
    status: 200,
    description: 'Specification berhasil diupdate',
    schema: {
      example: {
        id: 'uuid',
        modelId: 'uuid',
        specName: 'Engine Updated',
        specCategory: 'engine',
        specValue: '1600cc',
        specUnit: 'cc',
        description: 'Engine displacement - Updated',
        isActive: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Spesifikasi tidak ditemukan' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async update(
    @Param('id') id: string,
    @Body() updateSpecificationDto: UpdateSpecificationDto,
  ) {
    return this.specificationService.update(id, updateSpecificationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete specification by ID (Admin Only)' })
  @ApiParam({
    name: 'id',
    description: 'Specification ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Specification berhasil dihapus (No Content)',
  })
  @ApiResponse({ status: 404, description: 'Spesifikasi tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async remove(@Param('id') id: string) {
    await this.specificationService.remove(id);
  }
}
