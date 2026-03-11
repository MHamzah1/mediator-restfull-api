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
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerS3Config, MulterS3File } from '../config/s3.config';
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
  QueryShowroomViewDto,
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
  @UseInterceptors(FilesInterceptor('images', 10, multerS3Config))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Register kendaraan baru ke warehouse (Tahap 2)',
    description:
      'brandName, modelName, year, dan transmission diambil otomatis dari `variantId` dan `yearPriceId`. ' +
      'Pastikan sudah ada data di tabel variants dan year_prices sebelum register kendaraan.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'showroomId',
        'variantId',
        'yearPriceId',
        'color',
        'licensePlate',
        'chassisNumber',
        'engineNumber',
        'mileage',
        'fuelType',
        'askingPrice',
        'sellerName',
        'sellerPhone',
      ],
      properties: {
        showroomId: {
          type: 'string',
          example: 'uuid-showroom',
          description: 'ID showroom tujuan',
        },
        variantId: {
          type: 'string',
          example: 'uuid-dari-tabel-variants',
          description: 'ID variant dari tabel variants',
        },
        yearPriceId: {
          type: 'string',
          example: 'uuid-dari-tabel-year-prices',
          description: 'ID year price dari tabel year_prices',
        },
        color: { type: 'string', example: 'Hitam' },
        licensePlate: { type: 'string', example: 'B 1234 ABC' },
        chassisNumber: { type: 'string', example: 'MHKA6GJ3J1J012345' },
        engineNumber: { type: 'string', example: '2NR-U123456' },
        mileage: { type: 'number', example: 45000 },
        fuelType: { type: 'string', example: 'bensin' },
        askingPrice: {
          type: 'number',
          example: 230000000,
          description: 'Harga penawaran penjual',
        },
        sellerName: { type: 'string', example: 'John Doe' },
        sellerPhone: { type: 'string', example: '081234567890' },
        sellerWhatsapp: {
          type: 'string',
          example: '6281234567890',
          description: 'Nomor WhatsApp seller (format: 628xxx)',
        },
        sellerKtp: { type: 'string', example: '3273012345678901' },
        description: {
          type: 'string',
          example:
            'Mobil terawat, service rutin di dealer resmi. Kondisi istimewa.',
        },
        condition: {
          type: 'string',
          example: 'bekas',
          description: 'Kondisi mobil (baru/bekas)',
        },
        ownershipStatus: { type: 'string', example: 'Tangan Pertama' },
        taxStatus: { type: 'string', example: 'Pajak Hidup' },
        locationCity: { type: 'string', example: 'Jakarta Selatan' },
        locationProvince: { type: 'string', example: 'DKI Jakarta' },
        notes: { type: 'string', example: 'Catatan internal' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload 1-10 gambar mobil (max 5MB per file)',
        },
      },
    },
  })
  async register(
    @Request() req,
    @Body() dto: CreateWarehouseVehicleDto,
    @UploadedFiles() files?: MulterS3File[],
  ) {
    return this.svc.registerVehicle(req.user.userId, dto, files);
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

  @Post(':id/mark-ready')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Tandai kendaraan SIAP JUAL & pindahkan ke Gudang Ready Jual',
    description:
      'Otomatis mengubah status kendaraan menjadi READY dan memindahkan ke zona bertipe READY. ' +
      'Jika zona READY belum ada, akan dibuat otomatis. ' +
      'Status yang diizinkan: REGISTERED, IN_WAREHOUSE, IN_REPAIR.',
  })
  @ApiParam({ name: 'id', description: 'ID kendaraan' })
  async markReady(@Param('id') id: string, @Request() req) {
    return this.svc.markAsReadyToSell(id, req.user.userId);
  }

  @Post(':id/place-by-type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Pindahkan kendaraan ke zona berdasarkan tipe zona',
    description:
      'Otomatis mencari/membuat zona sesuai tipe, memindahkan kendaraan, ' +
      'dan mengubah status kendaraan sesuai tipe zona. ' +
      'Tipe zona: ready, light_repair, heavy_repair, holding, showroom_display.',
  })
  @ApiParam({ name: 'id', description: 'ID kendaraan' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['zoneType'],
      properties: {
        zoneType: {
          type: 'string',
          enum: [
            'ready',
            'light_repair',
            'heavy_repair',
            'holding',
            'showroom_display',
          ],
          description: 'Tipe zona tujuan',
        },
      },
    },
  })
  async placeByType(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { zoneType: string },
  ) {
    return this.svc.placeVehicleByZoneType(id, body.zoneType, req.user.userId);
  }
}

// ============================================================
// SHOWROOM VIEW ENDPOINTS (Card-based display)
// ============================================================
@ApiTags('Warehouse - Showroom View')
@Controller('api/warehouse/showroom-view')
export class ShowroomViewController {
  constructor(private readonly svc: WarehouseService) {}

  @Get(':showroomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Tampilan showroom (card-based) — list kendaraan dengan data lengkap',
    description:
      'Mengembalikan data kendaraan per showroom dalam format card-friendly. ' +
      'Termasuk: info mobil, zona saat ini, hasil inspeksi terakhir, status repair, ' +
      'dan daftar actions yang tersedia. Mendukung filter, search, sort, dan pagination.',
  })
  @ApiParam({ name: 'showroomId', description: 'ID showroom' })
  async getShowroomView(
    @Param('showroomId') showroomId: string,
    @Query() query: QueryShowroomViewDto,
  ) {
    return this.svc.getShowroomView(showroomId, query);
  }

  @Get('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Detail kendaraan lengkap (klik card) — inspeksi, repair, placement, dsb.',
    description:
      'Mengembalikan semua informasi terkait satu kendaraan: data lengkap, ' +
      'riwayat inspeksi, riwayat penempatan, repair orders, pembayaran admin, ' +
      'transaksi pembelian, stock logs, dan actions yang tersedia.',
  })
  @ApiParam({ name: 'vehicleId', description: 'ID kendaraan' })
  async getVehicleDetail(@Param('vehicleId') vehicleId: string) {
    return this.svc.getVehicleDetailForShowroom(vehicleId);
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

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List semua pembayaran admin (dengan filter showroom)',
  })
  @ApiQuery({ name: 'showroomId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'paid', 'failed', 'expired'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  async findAll(
    @Query('showroomId') showroomId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.svc.getAllAdminPayments(showroomId, status, page, perPage);
  }

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

  @Post(':vehicleId/simulate-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simulasi pembayaran admin berhasil (Development Only)',
    description:
      'Endpoint ini mensimulasikan callback dari payment gateway. ' +
      'Otomatis mengubah paymentStatus menjadi "paid" dan status kendaraan menjadi "registered". ' +
      'Hanya untuk development/testing.',
  })
  async simulatePayment(@Param('vehicleId') vehicleId: string) {
    return this.svc.simulateAdminPayment(vehicleId);
  }

  @Post(':vehicleId/pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buat invoice + langsung bayar admin fee (Tahap 2 - Combined)',
    description:
      'Membuat invoice Rp 2.000.000, langsung menandai sebagai PAID, ' +
      'dan mengubah status kendaraan menjadi IN_WAREHOUSE.',
  })
  async createAndPay(
    @Param('vehicleId') vehicleId: string,
    @Request() req,
    @Body() body: { paymentMethod?: string },
  ) {
    return this.svc.createAndPayAdminPayment(
      vehicleId,
      req.user.userId,
      body?.paymentMethod,
    );
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
