import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PriceAdjustmentService } from './price-adjustment.service';
import {
  CreatePriceAdjustmentDto,
  BulkCreatePriceAdjustmentDto,
} from './dto/create-price-adjustment.dto';
import { UpdatePriceAdjustmentDto } from './dto/update-price-adjustment.dto';
import { QueryPriceAdjustmentDto } from './dto/query-price-adjustment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Price Adjustments')
@Controller('api')
export class PriceAdjustmentController {
  constructor(
    private readonly priceAdjustmentService: PriceAdjustmentService,
  ) {}

  @Get('car-models/:modelId/price-adjustments')
  @ApiOperation({ summary: 'Get price adjustments by model (ENDPOINT UTAMA)' })
  @ApiParam({ name: 'modelId', description: 'Car Model ID' })
  @ApiResponse({
    status: 200,
    description: 'Price adjustments grouped by category',
    schema: {
      example: {
        modelId: 'uuid',
        modelName: 'Avanza',
        brandName: 'Toyota',
        adjustments: {
          transmission: [
            {
              id: 'uuid',
              code: 'matic',
              name: 'Transmisi Matic',
              adjustmentValue: 0,
              isBaseline: true,
            },
            {
              id: 'uuid',
              code: 'manual',
              name: 'Transmisi Manual',
              adjustmentValue: -5000000,
              isBaseline: false,
            },
          ],
          ownership: [],
          color: [],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Model not found' })
  async findByModelId(@Param('modelId', ParseUUIDPipe) modelId: string) {
    return this.priceAdjustmentService.findByModelId(modelId);
  }

  @Get('price-adjustments')
  @ApiOperation({ summary: 'Get all price adjustments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({
    name: 'modelId',
    required: false,
    type: String,
    description: 'Filter by model (WAJIB)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: [
      'ownership',
      'color',
      'feature',
      'condition',
      'kilometer',
      'accident_history',
      'document',
      'warranty',
      'service_record',
      'location',
    ],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of price adjustments' })
  async findAll(@Query() queryDto: QueryPriceAdjustmentDto) {
    return this.priceAdjustmentService.findAll(queryDto);
  }

  @Get('price-adjustments/:adjustmentId')
  @ApiOperation({ summary: 'Get price adjustment by ID' })
  @ApiParam({ name: 'adjustmentId', description: 'Price Adjustment ID' })
  @ApiResponse({ status: 200, description: 'Price adjustment details' })
  @ApiResponse({ status: 404, description: 'Price adjustment not found' })
  async findOne(@Param('adjustmentId', ParseUUIDPipe) adjustmentId: string) {
    return this.priceAdjustmentService.findOne(adjustmentId);
  }

  @Post('price-adjustments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create price adjustment (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Price adjustment created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  @ApiResponse({ status: 409, description: 'Adjustment already exists' })
  async create(@Body() createDto: CreatePriceAdjustmentDto) {
    return this.priceAdjustmentService.create(createDto);
  }

  @Post('car-models/:modelId/price-adjustments/bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Bulk create price adjustments for model (Admin Only)',
  })
  @ApiParam({ name: 'modelId', description: 'Car Model ID' })
  @ApiResponse({
    status: 201,
    description: 'Price adjustments created',
    schema: {
      example: {
        message: '7 price adjustments created successfully',
        modelId: 'uuid',
        modelName: 'Avanza',
        createdCount: 7,
        categories: { transmission: 2, ownership: 2, color: 3 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  async bulkCreate(
    @Param('modelId', ParseUUIDPipe) modelId: string,
    @Body() bulkDto: BulkCreatePriceAdjustmentDto,
  ) {
    return this.priceAdjustmentService.bulkCreate(modelId, bulkDto);
  }

  @Put('price-adjustments/:adjustmentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update price adjustment (Admin Only)' })
  @ApiParam({ name: 'adjustmentId', description: 'Price Adjustment ID' })
  @ApiResponse({ status: 200, description: 'Price adjustment updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Price adjustment not found' })
  async update(
    @Param('adjustmentId', ParseUUIDPipe) adjustmentId: string,
    @Body() updateDto: UpdatePriceAdjustmentDto,
  ) {
    return this.priceAdjustmentService.update(adjustmentId, updateDto);
  }

  @Delete('price-adjustments/:adjustmentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete price adjustment (Admin Only)' })
  @ApiParam({ name: 'adjustmentId', description: 'Price Adjustment ID' })
  @ApiResponse({ status: 204, description: 'Price adjustment deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Price adjustment not found' })
  async remove(@Param('adjustmentId', ParseUUIDPipe) adjustmentId: string) {
    return this.priceAdjustmentService.remove(adjustmentId);
  }
}
