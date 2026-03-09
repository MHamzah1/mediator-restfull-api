import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  CreateShowroomDto,
  CreateWarehouseVehicleDto,
  UpdateWarehouseVehicleDto,
  CreateInspectionDto,
  CreateZoneDto,
  PlaceVehicleDto,
  CreateRepairDto,
  CreatePurchaseDto,
  QueryWarehouseDto,
} from './dto';
import { VehicleStatus } from '../entities/warehouse-vehicle.entity';
import { RepairStatus } from '../entities/repair-order.entity';

// ============================================================
// SHOWROOM ENDPOINTS
// ============================================================
@ApiTags('Warehouse - Showrooms')
@Controller('api/warehouse/showrooms')
export class ShowroomController {
  constructor(private readonly svc: WarehouseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buat showroom baru' })
  async create(@Request() req, @Body() dto: CreateShowroomDto) {
    return this.svc.createShowroom(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List showroom milik user' })
  async findAll(@Request() req) {
    return this.svc.findAllShowrooms(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Detail showroom' })
  async findOne(@Param('id') id: string) {
    return this.svc.findOneShowroom(id);
  }

  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Dashboard summary showroom (stok, zona, status)' })
  async dashboard(@Param('id') id: string) {
    return this.svc.getShowroomDashboard(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update data showroom' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: CreateShowroomDto,
  ) {
    return this.svc.updateShowroom(id, req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete showroom (set isActive = false)' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.svc.deleteShowroom(id, req.user.userId);
  }
}

// ============================================================
// VEHICLE ENDPOINTS
// ============================================================
@ApiTags('Warehouse - Vehicles')
@Controller('api/warehouse/vehicles')
export class VehicleController {
  constructor(private readonly svc: WarehouseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register kendaraan baru ke warehouse (Tahap 2)',
    description:
      'brandName, modelName, year, dan transmission diambil otomatis dari `variantId` dan `yearPriceId`. ' +
      'Pastikan sudah ada data di tabel variants dan year_prices sebelum register kendaraan.',
  })
  @ApiBody({
    type: CreateWarehouseVehicleDto,
    examples: {
      contoh: {
        summary: 'Contoh request',
        value: {
          showroomId: 'uuid-showroom',
          variantId: 'uuid-dari-tabel-variants',
          yearPriceId: 'uuid-dari-tabel-year-prices',
          color: 'Hitam',
          licensePlate: 'B 1234 ABC',
          chassisNumber: 'MHKA6GJ3J1J012345',
          engineNumber: '2NR-U123456',
          mileage: 45000,
          fuelType: 'bensin',
          askingPrice: 230000000,
          sellerName: 'John Doe',
          sellerPhone: '081234567890',
        },
      },
    },
  })
  async register(@Request() req, @Body() dto: CreateWarehouseVehicleDto) {
    return this.svc.registerVehicle(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List semua kendaraan di warehouse (filter, pagination)',
  })
  async findAll(@Query() query: QueryWarehouseDto) {
    return this.svc.findAllVehicles(query);
  }

  @Get('barcode/:barcode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lookup kendaraan by barcode (untuk scan)' })
  @ApiParam({ name: 'barcode', example: 'SRM-JKT01-2026-00001' })
  async findByBarcode(@Param('barcode') barcode: string) {
    return this.svc.findVehicleByBarcode(barcode);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Detail kendaraan (+ inspeksi, placement, repairs)',
  })
  async findOne(@Param('id') id: string) {
    return this.svc.findOneVehicle(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update data kendaraan warehouse' })
  @ApiParam({ name: 'id', description: 'ID kendaraan' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseVehicleDto,
  ) {
    return this.svc.updateVehicle(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update status kendaraan' })
  @ApiQuery({ name: 'status', enum: VehicleStatus })
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: VehicleStatus,
    @Request() req,
  ) {
    return this.svc.updateVehicleStatus(id, status, req.user.userId);
  }

  @Post(':id/place')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tempatkan kendaraan di zona gudang (Tahap 3)' })
  async place(
    @Param('id') id: string,
    @Body() dto: PlaceVehicleDto,
    @Request() req,
  ) {
    return this.svc.placeVehicle(id, dto, req.user.userId);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Publish kendaraan ke marketplace (Tahap 4 - tombol READY)',
  })
  async publish(@Param('id') id: string, @Request() req) {
    return this.svc.publishToMarketplace(id, req.user.userId);
  }
}

// ============================================================
// INSPECTION ENDPOINTS
// ============================================================
@ApiTags('Warehouse - Inspections')
@Controller('api/warehouse/inspections')
export class InspectionController {
  constructor(private readonly svc: WarehouseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit hasil inspeksi kendaraan (Tahap 1)' })
  async create(@Request() req, @Body() dto: CreateInspectionDto) {
    return this.svc.createInspection(req.user.userId, dto);
  }

  @Get('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Riwayat inspeksi per kendaraan' })
  async getByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.svc.getInspectionsByVehicle(vehicleId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Detail inspeksi by ID' })
  async findOne(@Param('id') id: string) {
    return this.svc.getOneInspection(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update hasil inspeksi' })
  async update(@Param('id') id: string, @Body() dto: CreateInspectionDto) {
    return this.svc.updateInspection(id, dto);
  }
}

// ============================================================
// ZONE ENDPOINTS
// ============================================================
@ApiTags('Warehouse - Zones')
@Controller('api/warehouse/zones')
export class ZoneController {
  constructor(private readonly svc: WarehouseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buat zona gudang baru' })
  async create(@Body() dto: CreateZoneDto) {
    return this.svc.createZone(dto);
  }

  @Get('showroom/:showroomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List zona per showroom' })
  async findByShowroom(@Param('showroomId') showroomId: string) {
    return this.svc.findZonesByShowroom(showroomId);
  }

  @Get(':id/vehicles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List kendaraan yang ada di zona ini' })
  async getVehicles(@Param('id') id: string) {
    return this.svc.getVehiclesByZone(id);
  }

  @Patch(':id/capacity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update kapasitas zona gudang' })
  @ApiQuery({ name: 'capacity', type: Number })
  async updateCapacity(
    @Param('id') id: string,
    @Query('capacity') capacity: number,
  ) {
    return this.svc.updateZoneCapacity(id, capacity);
  }
}

// ============================================================
// REPAIR ENDPOINTS
// ============================================================
@ApiTags('Warehouse - Repairs')
@Controller('api/warehouse/repairs')
export class RepairController {
  constructor(private readonly svc: WarehouseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buat work order perbaikan' })
  async create(@Request() req, @Body() dto: CreateRepairDto) {
    return this.svc.createRepairOrder(req.user.userId, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update status perbaikan' })
  @ApiQuery({ name: 'status', enum: RepairStatus })
  @ApiQuery({ name: 'actualCost', required: false })
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: RepairStatus,
    @Query('actualCost') actualCost?: number,
  ) {
    return this.svc.updateRepairStatus(id, status, actualCost);
  }

  @Get('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Daftar perbaikan per kendaraan' })
  async getByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.svc.getRepairsByVehicle(vehicleId);
  }
}

// ============================================================
// ADMIN PAYMENT ENDPOINTS
// ============================================================
@ApiTags('Warehouse - Admin Payments')
@Controller('api/warehouse/payments')
export class AdminPaymentController {
  constructor(private readonly svc: WarehouseService) {}

  @Post(':vehicleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buat invoice pembayaran admin Rp 2.000.000 (Tahap 2)',
  })
  async create(@Param('vehicleId') vehicleId: string, @Request() req) {
    return this.svc.createAdminPayment(vehicleId, req.user.userId);
  }

  @Post('webhook/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook callback dari Payment Gateway (admin fee)',
  })
  async webhook(
    @Body()
    body: {
      invoiceNumber: string;
      status: string;
      paymentMethod?: string;
    },
  ) {
    return this.svc.handleAdminPaymentWebhook(
      body.invoiceNumber,
      body.status,
      body.paymentMethod,
    );
  }

  @Get(':vehicleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cek status pembayaran admin per kendaraan' })
  async getPayment(@Param('vehicleId') vehicleId: string) {
    return this.svc.getAdminPayment(vehicleId);
  }
}

// ============================================================
// PURCHASE TRANSACTION ENDPOINTS
// ============================================================
@ApiTags('Warehouse - Purchases')
@Controller('api/warehouse/purchases')
export class PurchaseController {
  constructor(private readonly svc: WarehouseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buat transaksi pembelian kendaraan (Tahap 5)' })
  async create(@Request() req, @Body() dto: CreatePurchaseDto) {
    return this.svc.createPurchase(req.user.userId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Detail transaksi pembelian' })
  async findOne(@Param('id') id: string) {
    return this.svc.getOnePurchase(id);
  }

  @Patch(':id/confirm-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Konfirmasi pembayaran manual (untuk cash/transfer offline)',
  })
  async confirmPayment(@Param('id') id: string, @Request() req) {
    return this.svc.confirmPurchasePayment(id, req.user.userId);
  }

  @Post('webhook/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook callback dari Payment Gateway (purchase)' })
  async webhook(
    @Body()
    body: {
      invoiceNumber: string;
      status: string;
      paymentMethod?: string;
    },
  ) {
    return this.svc.handlePurchaseWebhook(
      body.invoiceNumber,
      body.status,
      body.paymentMethod,
    );
  }

  @Get('showroom/:showroomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List transaksi pembelian per showroom' })
  async getByShowroom(@Param('showroomId') showroomId: string) {
    return this.svc.getPurchasesByShowroom(showroomId);
  }
}

// ============================================================
// STOCK LOG ENDPOINTS
// ============================================================
@ApiTags('Warehouse - Stock Logs')
@Controller('api/warehouse/stock')
export class StockLogController {
  constructor(private readonly svc: WarehouseService) {}

  @Get(':showroomId/logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Riwayat stok (audit trail)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async getLogs(
    @Param('showroomId') showroomId: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.svc.getStockLogs(showroomId, page || 1, perPage || 20);
  }

  @Get(':showroomId/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Summary stok per showroom (total, per status, in/out bulan ini)',
  })
  async getSummary(@Param('showroomId') showroomId: string) {
    return this.svc.getStockSummary(showroomId);
  }
}
