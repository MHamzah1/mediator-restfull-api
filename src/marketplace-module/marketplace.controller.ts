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
  Request,
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilterListingDto } from './dto/filter-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@ApiTags('Marketplace Listings')
@Controller('api/marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('listings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create listing mobil baru dengan upload foto (Seller)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'carModelId',
        'year',
        'price',
        'mileage',
        'transmission',
        'fuelType',
        'color',
        'locationCity',
        'locationProvince',
        'description',
        'sellerWhatsapp',
        'images',
      ],
      properties: {
        carModelId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        year: { type: 'number', example: 2020 },
        price: { type: 'number', example: 150000000 },
        mileage: { type: 'number', example: 50000 },
        transmission: { type: 'string', example: 'automatic' },
        fuelType: { type: 'string', example: 'bensin' },
        color: { type: 'string', example: 'Hitam Metalik' },
        locationCity: { type: 'string', example: 'Jakarta Selatan' },
        locationProvince: { type: 'string', example: 'DKI Jakarta' },
        description: {
          type: 'string',
          example:
            'Mobil terawat, service rutin di dealer resmi. Kondisi istimewa.',
        },
        condition: { type: 'string', example: 'bekas' },
        ownershipStatus: { type: 'string', example: 'Tangan Pertama' },
        taxStatus: { type: 'string', example: 'Pajak Hidup' },
        sellerWhatsapp: { type: 'string', example: '6281234567890' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload 1-10 gambar mobil (max 5MB per file)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Listing berhasil dibuat',
  })
  @ApiResponse({
    status: 400,
    description: 'Validasi gagal atau file tidak valid',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req,
    @Body() createListingDto: CreateListingDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Minimal 1 gambar diperlukan');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maksimal 10 gambar');
    }

    return this.marketplaceService.create(
      req.user.userId,
      createListingDto,
      files,
    );
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Get featured/unggulan listings (Public)',
  })
  @ApiResponse({
    status: 200,
    description: 'List mobil unggulan',
    schema: {
      example: {
        message: 'Berhasil mengambil mobil unggulan',
        data: [
          {
            id: '650e8400-e29b-41d4-a716-446655440000',
            carModel: {
              modelName: 'Avanza',
              brand: { name: 'Toyota', logo: 'https://...' },
            },
            year: 2023,
            price: 228000000,
            mileage: 15000,
            transmission: 'manual',
            fuelType: 'bensin',
            color: 'Hitam',
            locationCity: 'Jakarta Selatan',
            images: ['https://...'],
            isFeatured: true,
            featuredBadge: 'Populer',
            featuredUntil: '2026-01-17T00:00:00Z',
          },
        ],
        total: 5,
      },
    },
  })
  async findFeatured(
    @Query('limit') limit?: number,
    @Query('category') category?: string,
  ) {
    return this.marketplaceService.findFeatured(limit || 10, category);
  }

  @Get('listings')
  @ApiOperation({
    summary: 'Get all listings dengan pagination dan filter (Public) - Featured listings muncul pertama',
  })
  @ApiResponse({
    status: 200,
    description: 'List listings dengan pagination',
    schema: {
      example: {
        message: 'Berhasil mengambil data listing',
        data: [
          {
            id: '650e8400-e29b-41d4-a716-446655440000',
            seller: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              fullName: 'John Doe',
              whatsappNumber: '6281234567890',
            },
            carModel: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              modelName: 'Avanza',
              brand: {
                id: '450e8400-e29b-41d4-a716-446655440000',
                name: 'Toyota',
                logo: 'https://cdn.example.com/logo/toyota.png',
              },
            },
            year: 2020,
            price: 150000000,
            mileage: 50000,
            transmission: 'automatic',
            fuelType: 'bensin',
            color: 'Hitam Metalik',
            locationCity: 'Jakarta Selatan',
            locationProvince: 'DKI Jakarta',
            condition: 'bekas',
            ownershipStatus: 'Tangan Pertama',
            taxStatus: 'Pajak Hidup',
            images: ['https://cdn.example.com/car1.jpg'],
            viewCount: 125,
            createdAt: '2025-12-20T10:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalRecords: 45,
          totalPages: 3,
        },
      },
    },
  })
  async findAll(@Query() filterDto: FilterListingDto) {
    return this.marketplaceService.findAll(filterDto);
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my listings (Seller)' })
  @ApiResponse({
    status: 200,
    description: 'List my listings dengan summary',
    schema: {
      example: {
        message: 'Berhasil mengambil listing saya',
        data: [
          {
            id: '650e8400-e29b-41d4-a716-446655440000',
            carModel: {
              modelName: 'Avanza',
              brand: {
                name: 'Toyota',
              },
            },
            year: 2020,
            price: 150000000,
            isActive: true,
            viewCount: 126,
            contactClickCount: 8,
            createdAt: '2025-12-20T10:30:00Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalRecords: 3,
          totalPages: 1,
        },
        summary: {
          totalActiveListings: 2,
          totalInactiveListings: 1,
          totalViews: 215,
          totalContactClicks: 13,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async getMyListings(@Request() req, @Query() filterDto: FilterListingDto) {
    return this.marketplaceService.getMyListings(req.user.userId, filterDto);
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Get listing detail by ID (Public)' })
  @ApiParam({
    name: 'id',
    description: 'Listing ID (UUID)',
    example: '650e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail listing (viewCount auto increment)',
    schema: {
      example: {
        message: 'Berhasil mengambil detail listing',
        data: {
          id: '650e8400-e29b-41d4-a716-446655440000',
          seller: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            fullName: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '081234567890',
            whatsappNumber: '6281234567890',
            location: 'Jakarta Selatan',
          },
          carModel: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            modelName: 'Avanza',
            description: 'MPV terjangkau',
            basePrice: 155000000,
            brand: {
              id: '450e8400-e29b-41d4-a716-446655440000',
              name: 'Toyota',
              logo: 'https://cdn.example.com/logo/toyota.png',
            },
          },
          year: 2020,
          price: 150000000,
          mileage: 50000,
          transmission: 'automatic',
          fuelType: 'bensin',
          color: 'Hitam Metalik',
          locationCity: 'Jakarta Selatan',
          locationProvince: 'DKI Jakarta',
          description: 'Mobil terawat...',
          condition: 'bekas',
          ownershipStatus: 'Tangan Pertama',
          taxStatus: 'Pajak Hidup',
          images: [
            'https://cdn.example.com/car1-front.jpg',
            'https://cdn.example.com/car1-back.jpg',
          ],
          sellerWhatsapp: '6281234567890',
          isActive: true,
          viewCount: 126,
          contactClickCount: 8,
          createdAt: '2025-12-20T10:30:00Z',
          updatedAt: '2025-12-21T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Listing tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    return this.marketplaceService.findOne(id);
  }

  @Get('listings/:id/whatsapp')
  @ApiOperation({
    summary: 'Generate WhatsApp link untuk contact seller (Public)',
  })
  @ApiParam({
    name: 'id',
    description: 'Listing ID (UUID)',
    example: '650e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description:
      'WhatsApp link dengan pre-filled message (contactClickCount auto increment)',
    schema: {
      example: {
        message: 'Link WhatsApp berhasil di-generate',
        whatsappUrl:
          'https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik...',
        sellerPhone: '6281234567890',
        preFilledMessage:
          'Halo, saya tertarik dengan mobil Toyota Avanza 2020...',
        seller: {
          name: 'John Doe',
          location: 'Jakarta Selatan, DKI Jakarta',
        },
        listing: {
          id: '650e8400-e29b-41d4-a716-446655440000',
          carBrand: 'Toyota',
          carModel: 'Avanza',
          year: 2020,
          price: 150000000,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Listing tidak ditemukan' })
  @ApiResponse({ status: 400, description: 'Listing tidak aktif' })
  async generateWhatsappLink(@Param('id') id: string) {
    return this.marketplaceService.generateWhatsappLink(id);
  }

  @Put('listings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update listing dengan upload foto baru (Owner Only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Listing ID (UUID)',
    example: '650e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number', example: 145000000 },
        mileage: { type: 'number', example: 52000 },
        description: {
          type: 'string',
          example: 'HARGA TURUN! Mobil terawat...',
        },
        taxStatus: { type: 'string', example: 'Pajak Hidup' },
        isActive: { type: 'boolean', example: true },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload gambar baru (opsional, max 10 files)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Listing berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Listing tidak ditemukan' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Bukan pemilik listing',
  })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateListingDto: UpdateListingDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.marketplaceService.update(
      id,
      req.user.userId,
      updateListingDto,
      files,
    );
  }

  @Delete('listings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete listing by ID (Owner Only)' })
  @ApiParam({
    name: 'id',
    description: 'Listing ID (UUID)',
    example: '650e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Listing berhasil dihapus',
    schema: {
      example: {
        message: 'Listing berhasil dihapus',
        deletedId: '650e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Listing tidak ditemukan' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Bukan pemilik listing',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.marketplaceService.remove(id, req.user.userId);
  }
}
