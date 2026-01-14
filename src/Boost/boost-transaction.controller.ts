import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BoostTransactionService } from './boost-transaction.service';
import {
  CalculateBoostDto,
  CreateBoostOrderDto,
  QueryBoostTransactionDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Boost Transactions')
@Controller('api/boost')
export class BoostTransactionController {
  constructor(
    private readonly boostTransactionService: BoostTransactionService,
  ) {}

  @Post('calculate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Calculate boost estimation' })
  @ApiResponse({
    status: 200,
    description: 'Boost estimation',
    schema: {
      example: {
        listing: {
          id: 'uuid',
          title: 'Toyota Avanza 2020',
          currentViews: 125,
          image: 'https://...',
        },
        package: {
          id: 'uuid',
          name: 'Standard',
          price: 34000,
          durationDays: 3,
        },
        estimation: {
          reachMin: 12289,
          reachMax: 35514,
          priorityScore: 20,
          startDate: '2026-01-14T00:00:00Z',
          endDate: '2026-01-17T00:00:00Z',
        },
        totalAmount: 34000,
        currency: 'IDR',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Listing or package not found' })
  async calculateBoost(@Body() dto: CalculateBoostDto) {
    return this.boostTransactionService.calculateBoost(dto);
  }

  @Post('listings/:listingId/boost')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create boost order for listing' })
  @ApiParam({ name: 'listingId', description: 'Listing ID' })
  @ApiResponse({
    status: 201,
    description: 'Boost order created',
    schema: {
      example: {
        transaction: {
          id: 'uuid',
          listingId: 'uuid',
          amount: 34000,
          status: 'pending_payment',
          paymentStatus: 'pending',
          paymentMethod: 'ewallet',
          createdAt: '2026-01-14T10:30:00Z',
          expiresAt: '2026-01-14T11:30:00Z',
        },
        payment: {
          paymentUrl: 'https://payment-gateway.com/pay/xxx',
          paymentReference: 'BOOST-123456',
          instructions: ['...'],
        },
        estimatedReach: {
          min: 12289,
          max: 35514,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not listing owner' })
  @ApiResponse({ status: 404, description: 'Listing or package not found' })
  @ApiResponse({ status: 400, description: 'Listing already has active boost' })
  async createBoostOrder(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @Request() req,
    @Body() dto: CreateBoostOrderDto,
  ) {
    return this.boostTransactionService.createBoostOrder(
      listingId,
      req.user.id,
      dto,
    );
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my boost transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of boost transactions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyTransactions(
    @Request() req,
    @Query() query: QueryBoostTransactionDto,
  ) {
    return this.boostTransactionService.findMyTransactions(req.user.id, query);
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get boost transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not transaction owner' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const transaction = await this.boostTransactionService.findOne(id, req.user.id);
    return { data: transaction };
  }

  @Post('transactions/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pending boost transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Can only cancel pending transactions' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async cancelTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const transaction = await this.boostTransactionService.cancelTransaction(
      id,
      req.user.id,
    );
    return {
      message: 'Transaksi berhasil dibatalkan',
      data: transaction,
    };
  }

  @Get('transactions/:id/statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get boost transaction statistics' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction statistics',
    schema: {
      example: {
        transaction: {
          id: 'uuid',
          status: 'active',
          startDate: '2026-01-14T00:00:00Z',
          endDate: '2026-01-17T00:00:00Z',
          daysRemaining: 2,
        },
        estimation: {
          reachMin: 12289,
          reachMax: 35514,
        },
        actual: {
          totalImpressions: 8500,
          totalClicks: 342,
          totalContactClicks: 28,
          clickThroughRate: '4.02%',
          contactRate: '8.19%',
        },
        daily: [
          {
            date: '2026-01-14',
            impressions: 4200,
            clicks: 180,
            contactClicks: 15,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Statistics only for active/expired boosts' })
  async getStatistics(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    return this.boostTransactionService.getTransactionStatistics(id, req.user.id);
  }

  @Get('transactions/:id/check-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check payment status (manual)' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Payment status checked' })
  async checkPaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const transaction = await this.boostTransactionService.findOne(id, req.user.id);
    return {
      transactionId: transaction.id,
      paymentStatus: transaction.paymentStatus,
      boostStatus: transaction.status,
      paymentReference: transaction.paymentReference,
    };
  }
}
