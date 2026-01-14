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
import { BoostPackageService } from './boost-package.service';
import { CreateBoostPackageDto, UpdateBoostPackageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Boost Packages')
@Controller('api/boost/packages')
export class BoostPackageController {
  constructor(private readonly boostPackageService: BoostPackageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active boost packages (Public)' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive packages (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of boost packages',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Standard',
            price: 34000,
            durationDays: 3,
            estimatedReachMin: 12289,
            estimatedReachMax: 35514,
            priorityScore: 20,
            description: 'Paket standar dengan jangkauan 2x lipat',
          },
        ],
      },
    },
  })
  async findAll(@Query('includeInactive') includeInactive?: boolean) {
    const packages = await this.boostPackageService.findAll(includeInactive);
    return { data: packages };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get boost package by ID' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: 200, description: 'Package details' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const packageData = await this.boostPackageService.findOne(id);
    return { data: packageData };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create boost package (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Package created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Package name already exists' })
  async create(@Body() createDto: CreateBoostPackageDto) {
    const packageData = await this.boostPackageService.create(createDto);
    return {
      message: 'Paket boost berhasil dibuat',
      data: packageData,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update boost package (Admin Only)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: 200, description: 'Package updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBoostPackageDto,
  ) {
    const packageData = await this.boostPackageService.update(id, updateDto);
    return {
      message: 'Paket boost berhasil diupdate',
      data: packageData,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete boost package (Admin Only)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({ status: 200, description: 'Package deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.boostPackageService.remove(id);
    return { message: 'Paket boost berhasil dihapus' };
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Seed default packages (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Default packages seeded' })
  async seedPackages() {
    await this.boostPackageService.seedDefaultPackages();
    return { message: 'Default packages seeded successfully' };
  }
}
