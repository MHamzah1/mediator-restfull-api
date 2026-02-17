import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Showroom } from '../entities/showroom.entity';
import {
  WarehouseVehicle,
  VehicleStatus,
} from '../entities/warehouse-vehicle.entity';
import {
  VehicleInspection,
  InspectionResult,
} from '../entities/vehicle-inspection.entity';
import { WarehouseZone } from '../entities/warehouse-zone.entity';
import {
  VehiclePlacement,
  PlacementAction,
} from '../entities/vehicle-placement.entity';
import { RepairOrder, RepairStatus } from '../entities/repair-order.entity';
import { AdminPayment } from '../entities/admin-payment.entity';
import {
  PurchaseTransaction,
  PurchasePaymentStatus,
  PurchaseStatus,
} from '../entities/purchase-transaction.entity';
import { StockLog, StockAction } from '../entities/stock-log.entity';
import { Listing } from '../entities/listing.entity';
import { PaymentStatus } from '../entities/boost-transaction.entity';

// DTOs
import {
  CreateShowroomDto,
  CreateWarehouseVehicleDto,
  CreateInspectionDto,
  CreateZoneDto,
  PlaceVehicleDto,
  CreateRepairDto,
  CreatePurchaseDto,
  QueryWarehouseDto,
} from './dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Showroom) private showroomRepo: Repository<Showroom>,
    @InjectRepository(WarehouseVehicle)
    private vehicleRepo: Repository<WarehouseVehicle>,
    @InjectRepository(VehicleInspection)
    private inspectionRepo: Repository<VehicleInspection>,
    @InjectRepository(WarehouseZone)
    private zoneRepo: Repository<WarehouseZone>,
    @InjectRepository(VehiclePlacement)
    private placementRepo: Repository<VehiclePlacement>,
    @InjectRepository(RepairOrder) private repairRepo: Repository<RepairOrder>,
    @InjectRepository(AdminPayment)
    private adminPaymentRepo: Repository<AdminPayment>,
    @InjectRepository(PurchaseTransaction)
    private purchaseRepo: Repository<PurchaseTransaction>,
    @InjectRepository(StockLog) private stockLogRepo: Repository<StockLog>,
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
  ) {}

  // ============================================================
  // SHOWROOM CRUD
  // ============================================================
  async createShowroom(userId: string, dto: CreateShowroomDto) {
    const existing = await this.showroomRepo.findOne({
      where: { code: dto.code },
    });
    if (existing)
      throw new BadRequestException('Kode showroom sudah digunakan');

    const showroom = this.showroomRepo.create({ ...dto, ownerId: userId });
    const saved = await this.showroomRepo.save(showroom);
    return { message: 'Showroom berhasil dibuat', data: saved };
  }

  async findAllShowrooms(userId: string) {
    const data = await this.showroomRepo.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
    });
    return { message: 'Berhasil mengambil data showroom', data };
  }

  async findOneShowroom(id: string) {
    const showroom = await this.showroomRepo.findOne({ where: { id } });
    if (!showroom) throw new NotFoundException('Showroom tidak ditemukan');
    return { message: 'Detail showroom', data: showroom };
  }

  async getShowroomDashboard(showroomId: string) {
    const showroom = await this.showroomRepo.findOne({
      where: { id: showroomId },
    });
    if (!showroom) throw new NotFoundException('Showroom tidak ditemukan');

    const totalVehicles = await this.vehicleRepo.count({
      where: { showroomId },
    });
    const byStatus = {};
    for (const s of Object.values(VehicleStatus)) {
      byStatus[s] = await this.vehicleRepo.count({
        where: { showroomId, status: s },
      });
    }
    const zones = await this.zoneRepo.find({ where: { showroomId } });

    return {
      message: 'Dashboard showroom',
      data: { showroom, totalVehicles, vehiclesByStatus: byStatus, zones },
    };
  }

  async updateShowroom(
    id: string,
    userId: string,
    dto: Partial<CreateShowroomDto>,
  ) {
    const showroom = await this.showroomRepo.findOne({ where: { id } });
    if (!showroom) throw new NotFoundException('Showroom tidak ditemukan');
    if (showroom.ownerId !== userId)
      throw new ForbiddenException('Hanya pemilik yang bisa update');

    Object.assign(showroom, dto);
    const saved = await this.showroomRepo.save(showroom);
    return { message: 'Showroom berhasil diupdate', data: saved };
  }

  async deleteShowroom(id: string, userId: string) {
    const showroom = await this.showroomRepo.findOne({ where: { id } });
    if (!showroom) throw new NotFoundException('Showroom tidak ditemukan');
    if (showroom.ownerId !== userId)
      throw new ForbiddenException('Hanya pemilik yang bisa hapus');

    showroom.isActive = false;
    await this.showroomRepo.save(showroom);
    return { message: 'Showroom berhasil dinonaktifkan (soft delete)' };
  }

  // ============================================================
  // TAHAP 1 & 2: REGISTER VEHICLE + INSPECTION
  // ============================================================
  async registerVehicle(userId: string, dto: CreateWarehouseVehicleDto) {
    const showroom = await this.showroomRepo.findOne({
      where: { id: dto.showroomId },
    });
    if (!showroom) throw new NotFoundException('Showroom tidak ditemukan');

    // Generate barcode
    const count = await this.vehicleRepo.count({
      where: { showroomId: dto.showroomId },
    });
    const seq = String(count + 1).padStart(5, '0');
    const barcode = `${showroom.code}-${new Date().getFullYear()}-${seq}`;

    const vehicle = this.vehicleRepo.create({
      ...dto,
      sellerId: userId,
      barcode,
      status: VehicleStatus.INSPECTING,
    });
    const saved = await this.vehicleRepo.save(vehicle);

    return { message: 'Kendaraan berhasil didaftarkan', data: saved };
  }

  async findAllVehicles(query: QueryWarehouseDto) {
    const {
      page = 1,
      perPage = 20,
      search,
      showroomId,
      status,
      sortDirection = 'DESC',
    } = query;
    const qb = this.vehicleRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.showroom', 'showroom')
      .leftJoinAndSelect('v.carModel', 'carModel');

    if (showroomId) qb.andWhere('v.showroomId = :showroomId', { showroomId });
    if (status) qb.andWhere('v.status = :status', { status });
    if (search) {
      qb.andWhere(
        '(v.brandName ILIKE :s OR v.modelName ILIKE :s OR v.licensePlate ILIKE :s OR v.barcode ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    qb.orderBy('v.createdAt', sortDirection);
    const skip = (page - 1) * perPage;
    qb.skip(skip).take(perPage);

    const [data, total] = await qb.getManyAndCount();
    return {
      message: 'Berhasil mengambil data kendaraan',
      data,
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOneVehicle(id: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id },
      relations: ['showroom', 'seller', 'carModel'],
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    const inspections = await this.inspectionRepo.find({
      where: { warehouseVehicleId: id },
      order: { createdAt: 'DESC' },
    });
    const currentPlacement = await this.placementRepo.findOne({
      where: { warehouseVehicleId: id, isCurrent: true },
      relations: ['zone'],
    });
    const repairs = await this.repairRepo.find({
      where: { warehouseVehicleId: id },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Detail kendaraan',
      data: { ...vehicle, inspections, currentPlacement, repairs },
    };
  }

  async findVehicleByBarcode(barcode: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { barcode },
      relations: ['showroom'],
    });
    if (!vehicle)
      throw new NotFoundException(
        'Kendaraan dengan barcode tersebut tidak ditemukan',
      );
    return { message: 'Kendaraan ditemukan', data: vehicle };
  }

  async updateVehicleStatus(
    id: string,
    newStatus: VehicleStatus,
    userId: string,
  ) {
    const vehicle = await this.vehicleRepo.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    const prevStatus = vehicle.status;
    vehicle.status = newStatus;
    await this.vehicleRepo.save(vehicle);

    // Create stock log
    await this.stockLogRepo.save(
      this.stockLogRepo.create({
        showroomId: vehicle.showroomId,
        warehouseVehicleId: id,
        action: StockAction.STATUS_CHANGE,
        previousStatus: prevStatus,
        newStatus: newStatus,
        performedById: userId,
        notes: `Status diubah dari ${prevStatus} ke ${newStatus}`,
      }),
    );

    return {
      message: `Status kendaraan diubah ke ${newStatus}`,
      data: vehicle,
    };
  }

  // ============================================================
  // INSPEKSI
  // ============================================================
  async createInspection(inspectorId: string, dto: CreateInspectionDto) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: dto.warehouseVehicleId },
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    const inspection = this.inspectionRepo.create({ ...dto, inspectorId });
    const saved = await this.inspectionRepo.save(inspection);

    // Update vehicle status based on result
    if (dto.overallResult === InspectionResult.ACCEPTED_READY) {
      vehicle.status = VehicleStatus.REGISTERED;
    } else if (dto.overallResult === InspectionResult.ACCEPTED_REPAIR) {
      vehicle.status = VehicleStatus.REGISTERED;
    } else {
      vehicle.status = VehicleStatus.REJECTED;
    }
    await this.vehicleRepo.save(vehicle);

    return { message: 'Hasil inspeksi berhasil disimpan', data: saved };
  }

  async getInspectionsByVehicle(vehicleId: string) {
    const data = await this.inspectionRepo.find({
      where: { warehouseVehicleId: vehicleId },
      relations: ['inspector'],
      order: { createdAt: 'DESC' },
    });
    return { message: 'Riwayat inspeksi', data };
  }

  async getOneInspection(id: string) {
    const data = await this.inspectionRepo.findOne({
      where: { id },
      relations: ['inspector', 'warehouseVehicle'],
    });
    if (!data) throw new NotFoundException('Inspeksi tidak ditemukan');
    return { message: 'Detail inspeksi', data };
  }

  async updateInspection(id: string, dto: Partial<CreateInspectionDto>) {
    const inspection = await this.inspectionRepo.findOne({ where: { id } });
    if (!inspection) throw new NotFoundException('Inspeksi tidak ditemukan');

    Object.assign(inspection, dto);
    const saved = await this.inspectionRepo.save(inspection);

    // Update vehicle status if result changed
    if (dto.overallResult) {
      const vehicle = await this.vehicleRepo.findOne({
        where: { id: inspection.warehouseVehicleId },
      });
      if (vehicle) {
        if (dto.overallResult === InspectionResult.REJECTED) {
          vehicle.status = VehicleStatus.REJECTED;
        } else {
          vehicle.status = VehicleStatus.REGISTERED;
        }
        await this.vehicleRepo.save(vehicle);
      }
    }

    return { message: 'Inspeksi berhasil diupdate', data: saved };
  }

  // ============================================================
  // WAREHOUSE ZONES
  // ============================================================
  async createZone(dto: CreateZoneDto) {
    const zone = this.zoneRepo.create(dto);
    const saved = await this.zoneRepo.save(zone);
    return { message: 'Zona gudang berhasil dibuat', data: saved };
  }

  async findZonesByShowroom(showroomId: string) {
    const data = await this.zoneRepo.find({
      where: { showroomId },
      order: { code: 'ASC' },
    });
    return { message: 'Daftar zona gudang', data };
  }

  async getVehiclesByZone(zoneId: string) {
    const placements = await this.placementRepo.find({
      where: { zoneId, isCurrent: true },
      relations: ['warehouseVehicle'],
      order: { placedAt: 'DESC' },
    });
    const vehicles = placements.map((p) => ({
      ...p.warehouseVehicle,
      placedAt: p.placedAt,
      placementId: p.id,
    }));
    return {
      message: 'Kendaraan di zona ini',
      data: vehicles,
      total: vehicles.length,
    };
  }

  async updateZoneCapacity(zoneId: string, capacity: number) {
    const zone = await this.zoneRepo.findOne({ where: { id: zoneId } });
    if (!zone) throw new NotFoundException('Zona tidak ditemukan');
    if (capacity < zone.currentCount) {
      throw new BadRequestException(
        `Kapasitas tidak bisa kurang dari jumlah kendaraan saat ini (${zone.currentCount})`,
      );
    }
    zone.capacity = capacity;
    const saved = await this.zoneRepo.save(zone);
    return { message: 'Kapasitas zona berhasil diupdate', data: saved };
  }

  // ============================================================
  // TAHAP 3: PENEMPATAN KENDARAAN DI ZONA
  // ============================================================
  async placeVehicle(vehicleId: string, dto: PlaceVehicleDto, userId: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    const zone = await this.zoneRepo.findOne({ where: { id: dto.zoneId } });
    if (!zone) throw new NotFoundException('Zona tidak ditemukan');
    if (zone.currentCount >= zone.capacity)
      throw new BadRequestException('Zona sudah penuh');

    // Deactivate old placement
    await this.placementRepo.update(
      { warehouseVehicleId: vehicleId, isCurrent: true },
      {
        isCurrent: false,
        removedAt: new Date(),
        action: PlacementAction.MOVED,
      },
    );

    // Also decrement old zone
    const oldPlacement = await this.placementRepo.findOne({
      where: { warehouseVehicleId: vehicleId },
      order: { createdAt: 'DESC' },
    });
    if (oldPlacement && oldPlacement.zoneId !== dto.zoneId) {
      await this.zoneRepo.decrement(
        { id: oldPlacement.zoneId },
        'currentCount',
        1,
      );
    }

    // Create new placement
    const placement = this.placementRepo.create({
      warehouseVehicleId: vehicleId,
      zoneId: dto.zoneId,
      scannedById: userId,
      action: PlacementAction.PLACED,
      isCurrent: true,
    });
    await this.placementRepo.save(placement);
    await this.zoneRepo.increment({ id: dto.zoneId }, 'currentCount', 1);

    // Update vehicle status
    if (
      vehicle.status === VehicleStatus.REGISTERED ||
      vehicle.status === VehicleStatus.PENDING_PAYMENT
    ) {
      vehicle.status = VehicleStatus.IN_WAREHOUSE;
      await this.vehicleRepo.save(vehicle);
    }

    // Stock log
    await this.stockLogRepo.save(
      this.stockLogRepo.create({
        showroomId: vehicle.showroomId,
        warehouseVehicleId: vehicleId,
        action: StockAction.VEHICLE_IN,
        newStatus: vehicle.status,
        performedById: userId,
        notes: `Ditempatkan di zona ${zone.code} - ${zone.name}`,
      }),
    );

    return {
      message: `Kendaraan ditempatkan di zona ${zone.code}`,
      data: placement,
    };
  }

  // ============================================================
  // REPAIR ORDERS
  // ============================================================
  async createRepairOrder(userId: string, dto: CreateRepairDto) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: dto.warehouseVehicleId },
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    const repair = this.repairRepo.create(dto);
    const saved = await this.repairRepo.save(repair);

    vehicle.status = VehicleStatus.IN_REPAIR;
    await this.vehicleRepo.save(vehicle);

    return { message: 'Work order perbaikan berhasil dibuat', data: saved };
  }

  async updateRepairStatus(
    repairId: string,
    status: RepairStatus,
    actualCost?: number,
  ) {
    const repair = await this.repairRepo.findOne({ where: { id: repairId } });
    if (!repair) throw new NotFoundException('Repair order tidak ditemukan');

    repair.status = status;
    if (status === RepairStatus.IN_PROGRESS) repair.startedAt = new Date();
    if (status === RepairStatus.COMPLETED) {
      repair.completedAt = new Date();
      if (actualCost) repair.actualCost = actualCost;

      // Move vehicle to ready status
      const vehicle = await this.vehicleRepo.findOne({
        where: { id: repair.warehouseVehicleId },
      });
      if (vehicle) {
        vehicle.status = VehicleStatus.READY;
        await this.vehicleRepo.save(vehicle);
      }
    }
    await this.repairRepo.save(repair);

    return { message: `Status perbaikan diubah ke ${status}`, data: repair };
  }

  async getRepairsByVehicle(vehicleId: string) {
    const data = await this.repairRepo.find({
      where: { warehouseVehicleId: vehicleId },
      relations: ['assignedTo'],
      order: { createdAt: 'DESC' },
    });
    return { message: 'Daftar perbaikan', data };
  }

  // ============================================================
  // ADMIN PAYMENT (Biaya Admin Rp 2.000.000)
  // ============================================================
  async createAdminPayment(vehicleId: string, payerId: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    // Generate invoice number
    const count = await this.adminPaymentRepo.count();
    const invoiceNumber = `INV-WH-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // Simulated Payment Gateway URL (in production, call Midtrans/Xendit here)
    const paymentUrl = `https://payment-gateway.example.com/pay/${invoiceNumber}`;

    const payment = this.adminPaymentRepo.create({
      warehouseVehicleId: vehicleId,
      payerId,
      amount: 2000000,
      invoiceNumber,
      paymentUrl,
      paymentStatus: PaymentStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    const saved = await this.adminPaymentRepo.save(payment);

    vehicle.status = VehicleStatus.PENDING_PAYMENT;
    await this.vehicleRepo.save(vehicle);

    return {
      message: 'Invoice pembayaran admin berhasil dibuat',
      data: saved,
      paymentUrl,
      amount: 'Rp 2.000.000',
    };
  }

  async handleAdminPaymentWebhook(
    invoiceNumber: string,
    status: string,
    paymentMethod?: string,
  ) {
    const payment = await this.adminPaymentRepo.findOne({
      where: { invoiceNumber },
    });
    if (!payment) throw new NotFoundException('Payment tidak ditemukan');

    if (status === 'paid') {
      payment.paymentStatus = PaymentStatus.PAID;
      payment.paidAt = new Date();
      if (paymentMethod) payment.paymentMethod = paymentMethod as any;
      await this.adminPaymentRepo.save(payment);

      // Update vehicle status
      const vehicle = await this.vehicleRepo.findOne({
        where: { id: payment.warehouseVehicleId },
      });
      if (vehicle) {
        vehicle.status = VehicleStatus.REGISTERED;
        await this.vehicleRepo.save(vehicle);
      }

      return {
        message: 'Pembayaran admin berhasil dikonfirmasi',
        data: payment,
      };
    } else {
      payment.paymentStatus = status as any;
      await this.adminPaymentRepo.save(payment);
      return {
        message: `Status pembayaran diubah ke ${status}`,
        data: payment,
      };
    }
  }

  async getAdminPayment(vehicleId: string) {
    const data = await this.adminPaymentRepo.findOne({
      where: { warehouseVehicleId: vehicleId },
      relations: ['payer'],
    });
    if (!data) throw new NotFoundException('Payment tidak ditemukan');
    return { message: 'Detail pembayaran admin', data };
  }

  // ============================================================
  // TAHAP 4: PUBLISH TO MARKETPLACE
  // ============================================================
  async publishToMarketplace(vehicleId: string, userId: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
      relations: ['showroom'],
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');
    if (vehicle.status !== VehicleStatus.READY) {
      throw new BadRequestException(
        `Kendaraan belum ready (status saat ini: ${vehicle.status})`,
      );
    }

    // Create Listing from warehouse vehicle data
    const listing = this.listingRepo.create({
      sellerId: vehicle.sellerId,
      carModelId: vehicle.carModelId,
      year: vehicle.year,
      price: vehicle.askingPrice,
      mileage: vehicle.mileage,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      color: vehicle.color,
      locationCity: vehicle.showroom?.city || '',
      locationProvince: vehicle.showroom?.province || '',
      description:
        `${vehicle.brandName} ${vehicle.modelName} ${vehicle.year} - ${vehicle.color}. ${vehicle.notes || ''}`.trim(),
      condition: 'bekas',
      images: vehicle.images || [],
      sellerWhatsapp: vehicle.showroom?.whatsapp || vehicle.sellerPhone,
      isActive: true,
      // New warehouse fields (will be added via listing modification)
    });

    const savedListing = await this.listingRepo.save(listing);

    // Update vehicle status and link to listing
    vehicle.status = VehicleStatus.LISTED;
    vehicle.listingId = savedListing.id;
    await this.vehicleRepo.save(vehicle);

    // Stock log
    await this.stockLogRepo.save(
      this.stockLogRepo.create({
        showroomId: vehicle.showroomId,
        warehouseVehicleId: vehicleId,
        action: StockAction.STATUS_CHANGE,
        previousStatus: VehicleStatus.READY,
        newStatus: VehicleStatus.LISTED,
        performedById: userId,
        notes: `Dipublikasi ke marketplace, Listing ID: ${savedListing.id}`,
      }),
    );

    return {
      message: 'Kendaraan berhasil dipublikasi ke marketplace',
      data: { vehicle, listing: savedListing },
    };
  }

  // ============================================================
  // TAHAP 5: PURCHASE TRANSACTION
  // ============================================================
  async createPurchase(buyerId: string, dto: CreatePurchaseDto) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: dto.warehouseVehicleId },
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');
    if (
      vehicle.status !== VehicleStatus.LISTED &&
      vehicle.status !== VehicleStatus.READY
    ) {
      throw new BadRequestException('Kendaraan tidak tersedia untuk dibeli');
    }

    const count = await this.purchaseRepo.count();
    const invoiceNumber = `INV-PUR-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const paymentUrl = `https://payment-gateway.example.com/purchase/${invoiceNumber}`;

    const purchase = this.purchaseRepo.create({
      ...dto,
      buyerId,
      invoiceNumber,
      paymentUrl,
      listingId: vehicle.listingId,
    });
    const saved = await this.purchaseRepo.save(purchase);

    return {
      message: 'Transaksi pembelian berhasil dibuat',
      data: saved,
      paymentUrl,
    };
  }

  async getOnePurchase(id: string) {
    const data = await this.purchaseRepo.findOne({
      where: { id },
      relations: ['warehouseVehicle', 'buyer', 'listing'],
    });
    if (!data) throw new NotFoundException('Transaksi tidak ditemukan');
    return { message: 'Detail transaksi pembelian', data };
  }

  async confirmPurchasePayment(id: string, userId: string) {
    const purchase = await this.purchaseRepo.findOne({ where: { id } });
    if (!purchase) throw new NotFoundException('Transaksi tidak ditemukan');

    purchase.paymentStatus = PurchasePaymentStatus.FULLY_PAID;
    purchase.status = PurchaseStatus.COMPLETED;
    purchase.paidAt = new Date();
    purchase.completedAt = new Date();
    await this.purchaseRepo.save(purchase);

    // Trigger sale completion
    await this.completeVehicleSale(purchase.warehouseVehicleId, userId);

    return {
      message: 'Pembayaran dikonfirmasi manual, kendaraan SOLD',
      data: purchase,
    };
  }

  async handlePurchaseWebhook(
    invoiceNumber: string,
    status: string,
    paymentMethod?: string,
  ) {
    const purchase = await this.purchaseRepo.findOne({
      where: { invoiceNumber },
    });
    if (!purchase) throw new NotFoundException('Transaksi tidak ditemukan');

    if (status === 'fully_paid' || status === 'paid') {
      purchase.paymentStatus = PurchasePaymentStatus.FULLY_PAID;
      purchase.status = PurchaseStatus.COMPLETED;
      purchase.paidAt = new Date();
      purchase.completedAt = new Date();
      if (paymentMethod) purchase.paymentMethod = paymentMethod as any;
      await this.purchaseRepo.save(purchase);

      // ===== TAHAP 6: AUTO STOCK REDUCTION =====
      await this.completeVehicleSale(
        purchase.warehouseVehicleId,
        purchase.buyerId,
      );

      return {
        message: 'Pembayaran berhasil & kendaraan SOLD',
        data: purchase,
      };
    } else if (status === 'dp_paid') {
      purchase.paymentStatus = PurchasePaymentStatus.DP_PAID;
      purchase.status = PurchaseStatus.CONFIRMED;
      purchase.paidAt = new Date();
      await this.purchaseRepo.save(purchase);
      return { message: 'DP diterima, transaksi dikonfirmasi', data: purchase };
    } else {
      purchase.paymentStatus = status as any;
      await this.purchaseRepo.save(purchase);
      return { message: `Status pembayaran: ${status}`, data: purchase };
    }
  }

  async getPurchasesByShowroom(showroomId: string) {
    const vehicles = await this.vehicleRepo.find({
      where: { showroomId },
      select: ['id'],
    });
    const vehicleIds = vehicles.map((v) => v.id);
    if (vehicleIds.length === 0)
      return { message: 'Tidak ada transaksi', data: [] };

    const data = await this.purchaseRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.warehouseVehicle', 'vehicle')
      .leftJoinAndSelect('p.buyer', 'buyer')
      .where('p.warehouseVehicleId IN (:...ids)', { ids: vehicleIds })
      .orderBy('p.createdAt', 'DESC')
      .getMany();

    return { message: 'Daftar transaksi pembelian', data };
  }

  // ============================================================
  // TAHAP 6: COMPLETE SALE & STOCK REDUCTION
  // ============================================================
  private async completeVehicleSale(vehicleId: string, performedById: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle) return;

    const prevStatus = vehicle.status;

    // 1. Update vehicle status → SOLD
    vehicle.status = VehicleStatus.SOLD;
    await this.vehicleRepo.save(vehicle);

    // 2. Deactivate listing in marketplace
    if (vehicle.listingId) {
      await this.listingRepo.update(vehicle.listingId, { isActive: false });
    }

    // 3. Remove from current zone
    const currentPlacement = await this.placementRepo.findOne({
      where: { warehouseVehicleId: vehicleId, isCurrent: true },
    });
    if (currentPlacement) {
      currentPlacement.isCurrent = false;
      currentPlacement.removedAt = new Date();
      currentPlacement.action = PlacementAction.REMOVED;
      await this.placementRepo.save(currentPlacement);

      // Decrement zone count
      await this.zoneRepo.decrement(
        { id: currentPlacement.zoneId },
        'currentCount',
        1,
      );
    }

    // 4. Create stock log: vehicle_out
    await this.stockLogRepo.save(
      this.stockLogRepo.create({
        showroomId: vehicle.showroomId,
        warehouseVehicleId: vehicleId,
        action: StockAction.VEHICLE_OUT,
        previousStatus: prevStatus,
        newStatus: VehicleStatus.SOLD,
        performedById,
        notes: 'Kendaraan terjual - stok otomatis berkurang',
      }),
    );
  }

  // ============================================================
  // STOCK LOGS & REPORTING
  // ============================================================
  async getStockLogs(showroomId: string, page = 1, perPage = 20) {
    const [data, total] = await this.stockLogRepo.findAndCount({
      where: { showroomId },
      relations: ['warehouseVehicle', 'performedBy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      message: 'Stock logs',
      data,
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async getStockSummary(showroomId: string) {
    const total = await this.vehicleRepo.count({ where: { showroomId } });
    const summary = {};
    for (const s of Object.values(VehicleStatus)) {
      summary[s] = await this.vehicleRepo.count({
        where: { showroomId, status: s },
      });
    }

    // Count this month's in/out
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const vehicleIn = await this.stockLogRepo
      .createQueryBuilder('sl')
      .where('sl.showroomId = :sid', { sid: showroomId })
      .andWhere('sl.action = :a', { a: StockAction.VEHICLE_IN })
      .andWhere('sl.createdAt >= :d', { d: firstDay })
      .getCount();
    const vehicleOut = await this.stockLogRepo
      .createQueryBuilder('sl')
      .where('sl.showroomId = :sid', { sid: showroomId })
      .andWhere('sl.action = :a', { a: StockAction.VEHICLE_OUT })
      .andWhere('sl.createdAt >= :d', { d: firstDay })
      .getCount();

    return {
      message: 'Stock summary',
      data: {
        totalVehicles: total,
        byStatus: summary,
        thisMonth: { vehicleIn, vehicleOut },
      },
    };
  }
}
