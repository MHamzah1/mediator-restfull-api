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
import { VariantService } from './variant.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { QueryVariantDto } from './dto/query-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Variants')
@Controller('api')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Get('variants')
  @ApiOperation({ summary: 'Get all variants' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'modelId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of variants' })
  async findAll(@Query() queryDto: QueryVariantDto) {
    return this.variantService.findAll(queryDto);
  }

  @Get('car-models/:modelId/variants')
  @ApiOperation({ summary: 'Get variants by model ID' })
  @ApiParam({ name: 'modelId', description: 'Car Model ID' })
  @ApiResponse({ status: 200, description: 'List of variants for the model' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  async findByModelId(
    @Param('modelId', ParseUUIDPipe) modelId: string,
    @Query() queryDto: QueryVariantDto,
  ) {
    return this.variantService.findByModelId(modelId, queryDto);
  }

  @Get('variants/:variantId')
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({ status: 200, description: 'Variant details' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async findOne(@Param('variantId', ParseUUIDPipe) variantId: string) {
    return this.variantService.findOne(variantId);
  }

  @Post('variants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new variant (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Variant created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  @ApiResponse({ status: 409, description: 'Variant code already exists' })
  async create(@Body() createVariantDto: CreateVariantDto) {
    return this.variantService.create(createVariantDto);
  }

  @Put('variants/:variantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update variant (Admin Only)' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({ status: 200, description: 'Variant updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async update(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.variantService.update(variantId, updateVariantDto);
  }

  @Delete('variants/:variantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete variant (Admin Only)' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({ status: 204, description: 'Variant deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async remove(@Param('variantId', ParseUUIDPipe) variantId: string) {
    return this.variantService.remove(variantId);
  }
}
