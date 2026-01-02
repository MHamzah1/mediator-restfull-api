import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PriceCalculatorService } from './price-calculator.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { QuickCalculateDto } from './dto/quick-calculate.dto';

@ApiTags('Price Calculator')
@Controller('api/price-calculator')
export class PriceCalculatorController {
  constructor(private readonly priceCalculatorService: PriceCalculatorService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate car price' })
  @ApiResponse({
    status: 200,
    description: 'Price calculation result',
  })
  @ApiResponse({ status: 400, description: 'Invalid adjustment code' })
  @ApiResponse({ status: 404, description: 'Variant or year price not found' })
  async calculate(@Body() calculateDto: CalculatePriceDto) {
    return this.priceCalculatorService.calculate(calculateDto);
  }

  @Get('quick')
  @ApiOperation({ summary: 'Quick calculate price' })
  @ApiQuery({ name: 'variantId', required: true, type: String })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'transmission', required: true, type: String })
  @ApiQuery({ name: 'ownership', required: true, type: String })
  @ApiQuery({ name: 'color', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Quick calculation result',
    schema: {
      example: {
        carName: 'Toyota Avanza G 2018',
        finalPrice: 135000000,
        formattedPrice: 'Rp 135.000.000',
      },
    },
  })
  async quickCalculate(@Query() quickDto: QuickCalculateDto) {
    return this.priceCalculatorService.quickCalculate(quickDto);
  }

  @Get('options')
  @ApiOperation({ summary: 'Get available options for calculator (brands and years)' })
  @ApiResponse({
    status: 200,
    description: 'Available options',
    schema: {
      example: {
        brands: [
          { id: 'uuid', name: 'Toyota', logo: 'https://...' },
          { id: 'uuid', name: 'Honda', logo: 'https://...' },
        ],
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
      },
    },
  })
  async getOptions() {
    return this.priceCalculatorService.getOptions();
  }

  @Get('brands/:brandId/models')
  @ApiOperation({ summary: 'Get models by brand for calculator' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiResponse({
    status: 200,
    description: 'Models for the brand',
    schema: {
      example: {
        brandId: 'uuid',
        brandName: 'Toyota',
        models: [
          { id: 'uuid', modelName: 'Avanza', imageUrl: 'https://...' },
          { id: 'uuid', modelName: 'Fortuner', imageUrl: 'https://...' },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async getModelsByBrand(@Param('brandId', ParseUUIDPipe) brandId: string) {
    return this.priceCalculatorService.getModelsByBrand(brandId);
  }

  @Get('variants/:variantId/years')
  @ApiOperation({ summary: 'Get available years by variant' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({
    status: 200,
    description: 'Available years for the variant',
    schema: {
      example: {
        variantId: 'uuid',
        variantName: 'G',
        modelName: 'Avanza',
        brandName: 'Toyota',
        years: [2024, 2023, 2022, 2021, 2020],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async getYearsByVariant(@Param('variantId', ParseUUIDPipe) variantId: string) {
    return this.priceCalculatorService.getYearsByVariant(variantId);
  }
}
