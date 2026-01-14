import {
  Controller,
  Get,
  Put,
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
} from '@nestjs/swagger';
import { BoostTransactionService } from './boost-transaction.service';
import { AdminQueryBoostTransactionDto } from './dto';
import { BoostStatus } from '../entities/boost-transaction.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Admin - Boost Management')
@Controller('api/admin/boost')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BoostAdminController {
  constructor(
    private readonly boostTransactionService: BoostTransactionService,
  ) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Get all boost transactions (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'List of all boost transactions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: AdminQueryBoostTransactionDto) {
    return this.boostTransactionService.adminFindAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get boost revenue statistics (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Boost statistics',
    schema: {
      example: {
        overview: {
          totalTransactions: 150,
          paidTransactions: 120,
          activeBoosts: 45,
          totalRevenue: 5400000,
        },
        revenueByPackage: [
          { packageName: 'Standard', count: 50, total: 1700000 },
          { packageName: 'Premium', count: 30, total: 1800000 },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics() {
    return this.boostTransactionService.adminGetStatistics();
  }

  @Put('transactions/:id/status')
  @ApiOperation({ summary: 'Update boost transaction status (Admin)' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: BoostStatus },
  ) {
    const transaction = await this.boostTransactionService.adminUpdateStatus(
      id,
      body.status,
    );
    return {
      message: 'Status transaksi berhasil diupdate',
      data: transaction,
    };
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get boost transaction detail (Admin)' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const transaction = await this.boostTransactionService.findOne(id);
    return { data: transaction };
  }
}
