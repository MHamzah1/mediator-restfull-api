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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilterListingDto } from './dto/filter-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Marketplace Listings')
@Controller('api/marketplace/listings')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create listing mobil baru (Seller)' })
  @ApiBody({ type: CreateListingDto })
  @ApiResponse({
    status: 201,
    description: 'Listing berhasil dibuat',
    schema: {
      example: {
        message: 'Listing berhasil dibuat',
        data: {
          id: '650e8400-e29b-41d4-a716-446655440000',
          sellerId: '550e8400-e29b-41d4-a716-446655440000',
          carModelId: '550e8400-e29b-41d4-a716-446655440001',
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
          images: ['https://cdn.example.com/car1.jpg'],
          sellerWhatsapp: '6281234567890',
          isActive: true,
          viewCount: 0,
          contactClickCount: 0,
          createdAt: '2025-12-21T10:30:00Z',
          updatedAt: '2025-12-21T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Model mobil tidak ditemukan' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async create(@Request() req, @Body() createListingDto: CreateListingDto) {
    return this.marketplaceService.create(req.user.userId, createListingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all listings dengan pagination dan filter (Public)',
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

  @Get(':id')
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

  @Get(':id/whatsapp')
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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update listing by ID (Owner Only)' })
  @ApiParam({
    name: 'id',
    description: 'Listing ID (UUID)',
    example: '650e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateListingDto })
  @ApiResponse({
    status: 200,
    description: 'Listing berhasil diupdate',
    schema: {
      example: {
        message: 'Listing berhasil diupdate',
        data: {
          id: '650e8400-e29b-41d4-a716-446655440000',
          price: 145000000,
          description: 'HARGA TURUN! Mobil terawat...',
          updatedAt: '2025-12-21T14:30:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Listing tidak ditemukan' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Bukan pemilik listing',
  })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateListingDto: UpdateListingDto,
  ) {
    return this.marketplaceService.update(
      id,
      req.user.userId,
      updateListingDto,
    );
  }

  @Delete(':id')
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
