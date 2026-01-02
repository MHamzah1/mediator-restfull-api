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
import { YearPriceService } from './year-price.service';
import {
  CreateYearPriceDto,
  BulkCreateYearPriceDto,
} from './dto/create-year-price.dto';
import { UpdateYearPriceDto } from './dto/update-year-price.dto';
import {
  QueryYearPriceDto,
  QueryYearPriceByVariantDto,
} from './dto/query-year-price.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Year Prices')
@Controller('api')
export class YearPriceController {
  constructor(private readonly yearPriceService: YearPriceService) {}

  @Get('variants/:variantId/year-prices')
  @ApiOperation({ summary: 'Get year prices by variant' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiQuery({ name: 'yearFrom', required: false, type: Number })
  @ApiQuery({ name: 'yearTo', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Year prices for variant' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async findByVariantId(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Query() queryDto: QueryYearPriceByVariantDto,
  ) {
    return this.yearPriceService.findByVariantId(variantId, queryDto);
  }

  @Get('year-prices')
  @ApiOperation({ summary: 'Get all year prices' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'variantId', required: false, type: String })
  @ApiQuery({ name: 'modelId', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of year prices' })
  async findAll(@Query() queryDto: QueryYearPriceDto) {
    return this.yearPriceService.findAll(queryDto);
  }

  @Get('year-prices/:yearPriceId')
  @ApiOperation({ summary: 'Get year price by ID' })
  @ApiParam({ name: 'yearPriceId', description: 'Year Price ID' })
  @ApiResponse({ status: 200, description: 'Year price details' })
  @ApiResponse({ status: 404, description: 'Year price not found' })
  async findOne(@Param('yearPriceId', ParseUUIDPipe) yearPriceId: string) {
    return this.yearPriceService.findOne(yearPriceId);
  }

  @Post('year-prices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create year price (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Year price created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  @ApiResponse({ status: 409, description: 'Year price already exists' })
  async create(@Body() createDto: CreateYearPriceDto) {
    return this.yearPriceService.create(createDto);
  }

  @Post('year-prices/bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bulk create year prices (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Year prices created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async bulkCreate(@Body() bulkDto: BulkCreateYearPriceDto) {
    return this.yearPriceService.bulkCreate(bulkDto);
  }

  @Put('year-prices/:yearPriceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update year price (Admin Only)' })
  @ApiParam({ name: 'yearPriceId', description: 'Year Price ID' })
  @ApiResponse({ status: 200, description: 'Year price updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Year price not found' })
  async update(
    @Param('yearPriceId', ParseUUIDPipe) yearPriceId: string,
    @Body() updateDto: UpdateYearPriceDto,
  ) {
    return this.yearPriceService.update(yearPriceId, updateDto);
  }

  @Delete('year-prices/:yearPriceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete year price (Admin Only)' })
  @ApiParam({ name: 'yearPriceId', description: 'Year Price ID' })
  @ApiResponse({ status: 204, description: 'Year price deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Year price not found' })
  async remove(@Param('yearPriceId', ParseUUIDPipe) yearPriceId: string) {
    return this.yearPriceService.remove(yearPriceId);
  }
}
