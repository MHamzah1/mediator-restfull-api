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
import { Variant } from '../entities/variant.entity';
import { YearPrice } from '../entities/year-price.entity';
import { MulterS3File, convertToMulterS3File } from '../config/s3.config';

// DTOs
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
import { ZoneType } from '../entities/warehouse-zone.entity';

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
    @InjectRepository(Variant) private variantRepo: Repository<Variant>,
    @InjectRepository(YearPrice) private yearPriceRepo: Repository<YearPrice>,
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
  async registerVehicle(
    userId: string,
    dto: CreateWarehouseVehicleDto,
    files?: MulterS3File[],
  ) {
    const showroom = await this.showroomRepo.findOne({
      where: { id: dto.showroomId },
    });
    if (!showroom) throw new NotFoundException('Showroom tidak ditemukan');

    // ── Cek duplikasi chassisNumber & licensePlate ────────────────────────────
    const existingChassis = await this.vehicleRepo.findOne({
      where: { chassisNumber: dto.chassisNumber },
    });
    if (existingChassis)
      throw new BadRequestException(
        `Nomor rangka (chassisNumber) "${dto.chassisNumber}" sudah terdaftar di sistem.`,
      );

    const existingPlate = await this.vehicleRepo.findOne({
      where: { licensePlate: dto.licensePlate },
    });
    if (existingPlate)
      throw new BadRequestException(
        `Nomor plat (licensePlate) "${dto.licensePlate}" sudah terdaftar di sistem.`,
      );

    // ── Lookup Variant (brand, model, transmisi) ────────────────────────────
    const variant = await this.variantRepo.findOne({
      where: { id: dto.variantId },
      relations: ['model', 'model.brand'],
    });
    if (!variant) throw new NotFoundException('Variant tidak ditemukan');

    // ── Lookup YearPrice (tahun & harga pasar) ──────────────────────────────
    const yp = await this.yearPriceRepo.findOne({
      where: { id: dto.yearPriceId },
    });
    if (!yp) throw new NotFoundException('YearPrice tidak ditemukan');

    // ── Generate barcode ──────────────────────────────────────────────────────
    const count = await this.vehicleRepo.count({
      where: { showroomId: dto.showroomId },
    });
    const seq = String(count + 1).padStart(5, '0');
    const barcode = `${showroom.code}-${new Date().getFullYear()}-${seq}`;

    // ── Generate image URLs dari uploaded files ──────────────────────────────
    const imageUrls =
      files && files.length > 0
        ? files.map((file) => {
            // Jika sudah punya location (S3), gunakan itu
            if ((file as MulterS3File).location) {
              return (file as MulterS3File).location;
            }
            // Jika local storage, convert dan gunakan location
            const converted = convertToMulterS3File(file);
            return converted.location;
          })
        : [];

    const vehicle = this.vehicleRepo.create({
      ...dto,
      brandName: variant.model.brand.name,
      modelName: variant.model.modelName,
      year: yp.year,
      transmission: variant.transmissionType,
      carModelId: variant.modelId,
      variantId: variant.id,
      yearPriceId: yp.id,
      sellerId: userId,
      barcode,
      images: imageUrls,
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

  async updateVehicle(id: string, dto: UpdateWarehouseVehicleDto) {
    const vehicle = await this.vehicleRepo.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    // Update referensi variant jika diberikan
    if (dto.variantId) {
      const variant = await this.variantRepo.findOne({
        where: { id: dto.variantId },
        relations: ['model', 'model.brand'],
      });
      if (!variant) throw new NotFoundException('Variant tidak ditemukan');
      vehicle.variantId = variant.id;
      vehicle.carModelId = variant.modelId;
      vehicle.brandName = variant.model.brand.name;
      vehicle.modelName = variant.model.modelName;
      vehicle.transmission = variant.transmissionType;
    }

    // Update referensi year price jika diberikan
    if (dto.yearPriceId) {
      const yp = await this.yearPriceRepo.findOne({
        where: { id: dto.yearPriceId },
      });
      if (!yp) throw new NotFoundException('YearPrice tidak ditemukan');
      vehicle.yearPriceId = yp.id;
      vehicle.year = yp.year;
    }

    // Merge field fisik & penjual (variantId & yearPriceId sudah dihandle di atas)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variantId: _v, yearPriceId: _yp, ...rest } = dto;
    Object.assign(vehicle, rest);

    const saved = await this.vehicleRepo.save(vehicle);
    return { message: 'Kendaraan berhasil diupdate', data: saved };
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

    // Update vehicle status based on zone type
    const zoneStatusMap: Record<string, VehicleStatus> = {
      [ZoneType.READY]: VehicleStatus.READY,
      [ZoneType.LIGHT_REPAIR]: VehicleStatus.IN_REPAIR,
      [ZoneType.HEAVY_REPAIR]: VehicleStatus.IN_REPAIR,
      [ZoneType.HOLDING]: VehicleStatus.IN_WAREHOUSE,
      [ZoneType.SHOWROOM_DISPLAY]: VehicleStatus.IN_WAREHOUSE,
    };
    const newStatus = zoneStatusMap[zone.type] || VehicleStatus.IN_WAREHOUSE;
    vehicle.status = newStatus;
    await this.vehicleRepo.save(vehicle);

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

    // Auto-place in appropriate repair zone based on repair type
    try {
      const repairZoneType =
        dto.repairType === 'heavy'
          ? ZoneType.HEAVY_REPAIR
          : ZoneType.LIGHT_REPAIR;
      await this.autoPlaceInZone(vehicle, repairZoneType, userId);
    } catch (e) {
      // Zone placement is best-effort, don't fail the repair order
      console.warn('Auto-place to repair zone failed:', e.message);
    }

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

  async getAllAdminPayments(
    showroomId?: string,
    status?: string,
    page = 1,
    perPage = 20,
  ) {
    const qb = this.adminPaymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.warehouseVehicle', 'vehicle')
      .leftJoinAndSelect('payment.payer', 'payer')
      .orderBy('payment.createdAt', 'DESC');

    if (showroomId) {
      qb.andWhere('vehicle.showroomId = :showroomId', { showroomId });
    }

    if (status) {
      qb.andWhere('payment.paymentStatus = :status', { status });
    }

    const totalRecords = await qb.getCount();
    const data = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getMany();

    // Map data with vehicle info
    const mapped = data.map((p) => ({
      id: p.id,
      invoiceNumber: p.invoiceNumber,
      amount: p.amount,
      currency: p.currency,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      paymentReference: p.paymentReference,
      paidAt: p.paidAt,
      expiresAt: p.expiresAt,
      createdAt: p.createdAt,
      vehicle: p.warehouseVehicle
        ? {
            id: p.warehouseVehicle.id,
            brandName: p.warehouseVehicle.brandName,
            modelName: p.warehouseVehicle.modelName,
            year: p.warehouseVehicle.year,
            color: p.warehouseVehicle.color,
            licensePlate: p.warehouseVehicle.licensePlate,
            barcode: p.warehouseVehicle.barcode,
            askingPrice: p.warehouseVehicle.askingPrice,
            status: p.warehouseVehicle.status,
            images: p.warehouseVehicle.images,
            sellerName: p.warehouseVehicle.sellerName,
          }
        : null,
      payer: p.payer
        ? {
            id: p.payer.id,
            fullName: p.payer.fullName,
            email: p.payer.email,
          }
        : null,
    }));

    return {
      message: 'Daftar pembayaran admin',
      data: mapped,
      pagination: {
        page: Number(page),
        perPage: Number(perPage),
        totalRecords,
        totalPages: Math.ceil(totalRecords / perPage),
      },
    };
  }

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

  async simulateAdminPayment(vehicleId: string) {
    const payment = await this.adminPaymentRepo.findOne({
      where: { warehouseVehicleId: vehicleId },
    });
    if (!payment) throw new NotFoundException('Payment tidak ditemukan');

    if (payment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Pembayaran sudah lunas');
    }

    // Simulasi: langsung set paid
    payment.paymentStatus = PaymentStatus.PAID;
    payment.paidAt = new Date();
    payment.paymentMethod = 'simulated' as any;
    payment.paymentReference = `SIM-${Date.now()}`;
    await this.adminPaymentRepo.save(payment);

    // Update vehicle status → IN_WAREHOUSE (sudah bayar, siap masuk gudang)
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
    });
    if (vehicle) {
      vehicle.status = VehicleStatus.IN_WAREHOUSE;
      await this.vehicleRepo.save(vehicle);
    }

    return {
      message:
        'Simulasi pembayaran berhasil! Status: PAID, Kendaraan: IN_WAREHOUSE',
      data: payment,
    };
  }

  /**
   * Combined: Buat invoice + langsung bayar (untuk development / simulasi)
   * Mengembalikan detail rincian pembayaran
   */
  async createAndPayAdminPayment(
    vehicleId: string,
    payerId: string,
    paymentMethod?: string,
  ) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
      relations: ['showroom'],
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    // Check if already has payment
    let payment = await this.adminPaymentRepo.findOne({
      where: { warehouseVehicleId: vehicleId },
    });

    if (payment && payment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(
        'Pembayaran admin untuk kendaraan ini sudah lunas',
      );
    }

    // If no payment yet, create one
    if (!payment) {
      const count = await this.adminPaymentRepo.count();
      const invoiceNumber = `INV-WH-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

      payment = this.adminPaymentRepo.create({
        warehouseVehicleId: vehicleId,
        payerId,
        amount: 2000000,
        invoiceNumber,
        paymentUrl: null,
        paymentStatus: PaymentStatus.PENDING,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      payment = await this.adminPaymentRepo.save(payment);
    }

    // Immediately mark as paid
    payment.paymentStatus = PaymentStatus.PAID;
    payment.paidAt = new Date();
    payment.paymentMethod = (paymentMethod || 'transfer_bank') as any;
    payment.paymentReference = `PAY-${Date.now()}`;
    await this.adminPaymentRepo.save(payment);

    // Update vehicle status → IN_WAREHOUSE
    vehicle.status = VehicleStatus.IN_WAREHOUSE;
    await this.vehicleRepo.save(vehicle);

    // Create stock log
    await this.stockLogRepo.save(
      this.stockLogRepo.create({
        showroomId: vehicle.showroomId,
        warehouseVehicleId: vehicle.id,
        action: StockAction.STATUS_CHANGE,
        notes: `Pembayaran admin Rp 2.000.000 berhasil via ${paymentMethod || 'transfer_bank'}. Status → IN_WAREHOUSE`,
      }),
    );

    return {
      message: 'Pembayaran admin berhasil! Kendaraan siap masuk gudang.',
      data: {
        payment: {
          id: payment.id,
          invoiceNumber: payment.invoiceNumber,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          paidAt: payment.paidAt,
        },
        vehicle: {
          id: vehicle.id,
          brandName: vehicle.brandName,
          modelName: vehicle.modelName,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          barcode: vehicle.barcode,
          status: vehicle.status,
        },
      },
    };
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

  // ============================================================
  // FITUR: MARK AS READY TO SELL (Siap Jual)
  // Atomik: ubah status → READY + pindahkan ke zona READY
  // ============================================================
  /**
   * GENERIC: Auto-place vehicle in a zone by zone type
   * Finds or creates the appropriate zone, handles old placement, etc.
   */
  private async autoPlaceInZone(
    vehicle: WarehouseVehicle,
    zoneType: ZoneType,
    userId: string,
    opts?: { zoneName?: string; zoneCode?: string },
  ) {
    // Default zone configs
    const zoneDefaults: Record<string, { code: string; name: string }> = {
      [ZoneType.READY]: { code: 'GD-READY', name: 'Gudang Ready Dijual' },
      [ZoneType.LIGHT_REPAIR]: {
        code: 'GD-LR',
        name: 'Gudang Perbaikan Ringan',
      },
      [ZoneType.HEAVY_REPAIR]: {
        code: 'GD-HR',
        name: 'Gudang Perbaikan Berat',
      },
      [ZoneType.HOLDING]: { code: 'GD-HOLD', name: 'Gudang Holding' },
      [ZoneType.SHOWROOM_DISPLAY]: {
        code: 'GD-DISP',
        name: 'Display Showroom',
      },
    };
    const defaults = zoneDefaults[zoneType] || { code: 'GD-X', name: 'Gudang' };

    // Find or create zone
    let zone = await this.zoneRepo.findOne({
      where: { showroomId: vehicle.showroomId, type: zoneType, isActive: true },
    });
    if (!zone) {
      zone = this.zoneRepo.create({
        showroomId: vehicle.showroomId,
        code: opts?.zoneCode || defaults.code,
        name: opts?.zoneName || defaults.name,
        type: zoneType,
        capacity: 50,
        currentCount: 0,
        isActive: true,
      });
      zone = await this.zoneRepo.save(zone);
    }
    if (zone.currentCount >= zone.capacity) {
      throw new BadRequestException(
        `Zona "${zone.name}" sudah penuh (${zone.currentCount}/${zone.capacity})`,
      );
    }

    // Deactivate old placement
    const oldPlacement = await this.placementRepo.findOne({
      where: { warehouseVehicleId: vehicle.id, isCurrent: true },
    });
    if (oldPlacement) {
      oldPlacement.isCurrent = false;
      oldPlacement.removedAt = new Date();
      oldPlacement.action = PlacementAction.MOVED;
      await this.placementRepo.save(oldPlacement);
      if (oldPlacement.zoneId !== zone.id) {
        await this.zoneRepo.decrement(
          { id: oldPlacement.zoneId },
          'currentCount',
          1,
        );
      }
    }

    // Create new placement
    const placement = this.placementRepo.create({
      warehouseVehicleId: vehicle.id,
      zoneId: zone.id,
      scannedById: userId,
      action: PlacementAction.PLACED,
      isCurrent: true,
    });
    await this.placementRepo.save(placement);

    // Increment count (only if different zone)
    if (!oldPlacement || oldPlacement.zoneId !== zone.id) {
      await this.zoneRepo.increment({ id: zone.id }, 'currentCount', 1);
    }

    return { zone, placement };
  }

  /**
   * Place vehicle in zone by zone type (auto-find/create zone + update status)
   */
  async placeVehicleByZoneType(
    vehicleId: string,
    zoneType: string,
    userId: string,
  ) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
      relations: ['showroom'],
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    const validZoneTypes = Object.values(ZoneType);
    if (!validZoneTypes.includes(zoneType as ZoneType)) {
      throw new BadRequestException(
        `Tipe zona tidak valid: ${zoneType}. Valid: ${validZoneTypes.join(', ')}`,
      );
    }

    const prevStatus = vehicle.status;

    // Auto-place in zone
    const { zone, placement } = await this.autoPlaceInZone(
      vehicle,
      zoneType as ZoneType,
      userId,
    );

    // Update status based on zone type
    const zoneStatusMap: Record<string, VehicleStatus> = {
      [ZoneType.READY]: VehicleStatus.READY,
      [ZoneType.LIGHT_REPAIR]: VehicleStatus.IN_REPAIR,
      [ZoneType.HEAVY_REPAIR]: VehicleStatus.IN_REPAIR,
      [ZoneType.HOLDING]: VehicleStatus.IN_WAREHOUSE,
      [ZoneType.SHOWROOM_DISPLAY]: VehicleStatus.IN_WAREHOUSE,
    };
    vehicle.status = zoneStatusMap[zoneType] || VehicleStatus.IN_WAREHOUSE;
    await this.vehicleRepo.save(vehicle);

    // Stock log
    await this.stockLogRepo.save(
      this.stockLogRepo.create({
        showroomId: vehicle.showroomId,
        warehouseVehicleId: vehicleId,
        action: StockAction.ZONE_TRANSFER,
        previousStatus: prevStatus,
        newStatus: vehicle.status,
        performedById: userId,
        notes: `Dipindahkan ke zona "${zone.name}" (${zone.code})`,
      }),
    );

    const updated = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
      relations: ['showroom', 'variant', 'yearPrice'],
    });

    return {
      message: `Kendaraan berhasil dipindahkan ke zona "${zone.name}"`,
      data: { vehicle: updated, zone, placement },
    };
  }

  async markAsReadyToSell(vehicleId: string, userId: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
      relations: ['showroom'],
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    // Validasi: hanya kendaraan IN_WAREHOUSE, REGISTERED, atau IN_REPAIR (selesai repair) boleh di-mark ready
    const allowedStatuses = [
      VehicleStatus.IN_WAREHOUSE,
      VehicleStatus.REGISTERED,
      VehicleStatus.IN_REPAIR,
    ];
    if (!allowedStatuses.includes(vehicle.status)) {
      throw new BadRequestException(
        `Kendaraan tidak bisa di-set siap jual dari status "${vehicle.status}". ` +
          `Status yang diizinkan: ${allowedStatuses.join(', ')}`,
      );
    }

    // Cari zona READY milik showroom ini
    let readyZone = await this.zoneRepo.findOne({
      where: {
        showroomId: vehicle.showroomId,
        type: ZoneType.READY,
        isActive: true,
      },
    });

    // Jika belum ada zona READY, buat otomatis
    if (!readyZone) {
      readyZone = this.zoneRepo.create({
        showroomId: vehicle.showroomId,
        code: 'GD-READY',
        name: 'Gudang Ready Jual',
        type: ZoneType.READY,
        capacity: 50,
        currentCount: 0,
        isActive: true,
      });
      readyZone = await this.zoneRepo.save(readyZone);
    }

    // Cek kapasitas zona
    if (readyZone.currentCount >= readyZone.capacity) {
      throw new BadRequestException(
        `Zona "${readyZone.name}" sudah penuh (${readyZone.currentCount}/${readyZone.capacity})`,
      );
    }

    const prevStatus = vehicle.status;

    // 1. Deaktifkan placement lama (jika ada)
    const oldPlacement = await this.placementRepo.findOne({
      where: { warehouseVehicleId: vehicleId, isCurrent: true },
    });
    if (oldPlacement) {
      oldPlacement.isCurrent = false;
      oldPlacement.removedAt = new Date();
      oldPlacement.action = PlacementAction.MOVED;
      await this.placementRepo.save(oldPlacement);

      // Kurangi count zona lama
      if (oldPlacement.zoneId !== readyZone.id) {
        await this.zoneRepo.decrement(
          { id: oldPlacement.zoneId },
          'currentCount',
          1,
        );
      }
    }

    // 2. Buat placement baru di zona READY
    const placement = this.placementRepo.create({
      warehouseVehicleId: vehicleId,
      zoneId: readyZone.id,
      scannedById: userId,
      action: PlacementAction.PLACED,
      isCurrent: true,
    });
    await this.placementRepo.save(placement);

    // 3. Increment count zona READY (hanya jika beda zona atau baru pertama kali)
    if (!oldPlacement || oldPlacement.zoneId !== readyZone.id) {
      await this.zoneRepo.increment({ id: readyZone.id }, 'currentCount', 1);
    }

    // 4. Update status kendaraan → READY
    vehicle.status = VehicleStatus.READY;
    await this.vehicleRepo.save(vehicle);

    // 5. Stock log: zone transfer + status change
    await this.stockLogRepo.save(
      this.stockLogRepo.create({
        showroomId: vehicle.showroomId,
        warehouseVehicleId: vehicleId,
        action: StockAction.ZONE_TRANSFER,
        previousStatus: prevStatus,
        newStatus: VehicleStatus.READY,
        performedById: userId,
        notes: `Siap jual — dipindahkan ke zona "${readyZone.name}" (${readyZone.code})`,
      }),
    );

    // Reload vehicle with fresh data
    const updated = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
      relations: ['showroom', 'variant', 'yearPrice'],
    });

    return {
      message:
        'Kendaraan berhasil ditandai SIAP JUAL dan dipindahkan ke Gudang Ready Jual',
      data: {
        vehicle: updated,
        zone: readyZone,
        placement,
      },
    };
  }

  // ============================================================
  // FITUR: SHOWROOM VIEW (Card-based view)
  // Menampilkan data kendaraan lengkap per showroom untuk card display
  // ============================================================
  async getShowroomView(showroomId: string, query: QueryShowroomViewDto) {
    const showroom = await this.showroomRepo.findOne({
      where: { id: showroomId },
    });
    if (!showroom) throw new NotFoundException('Showroom tidak ditemukan');

    const {
      page = 1,
      perPage = 20,
      search,
      status,
      zoneType,
      sortDirection = 'DESC',
      sortBy = 'createdAt',
    } = query;

    // Build query
    const qb = this.vehicleRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.showroom', 'showroom')
      .leftJoinAndSelect('v.variant', 'variant')
      .leftJoinAndSelect('v.yearPrice', 'yearPrice')
      .leftJoinAndSelect('v.carModel', 'carModel')
      .where('v.showroomId = :showroomId', { showroomId });

    // Filter by status
    if (status) {
      qb.andWhere('v.status = :status', { status });
    }

    // Filter by zone type (join through current placement)
    if (zoneType) {
      qb.innerJoin(
        'vehicle_placements',
        'vp',
        'vp.warehouseVehicleId = v.id AND vp.isCurrent = true',
      )
        .innerJoin('warehouse_zones', 'z', 'z.id = vp.zoneId')
        .andWhere('z.type = :zoneType', { zoneType });
    }

    // Search by brand, model, plate, barcode
    if (search) {
      qb.andWhere(
        '(v.brandName ILIKE :search OR v.modelName ILIKE :search OR v.licensePlate ILIKE :search OR v.barcode ILIKE :search OR v.color ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'askingPrice', 'year', 'mileage'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`v.${sortField}`, sortDirection);

    // Pagination
    const total = await qb.getCount();
    const vehicles = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getMany();

    // Enrich: tambahkan current zone & latest inspection & available actions per vehicle
    const enriched = await Promise.all(
      vehicles.map(async (v) => {
        // Current placement + zone
        const currentPlacement = await this.placementRepo.findOne({
          where: { warehouseVehicleId: v.id, isCurrent: true },
        });
        let currentZone = null;
        if (currentPlacement) {
          currentZone = await this.zoneRepo.findOne({
            where: { id: currentPlacement.zoneId },
          });
        }

        // Latest inspection
        const latestInspection = await this.inspectionRepo.findOne({
          where: { warehouseVehicleId: v.id },
          order: { createdAt: 'DESC' },
        });

        // Active repair orders
        const activeRepair = await this.repairRepo.findOne({
          where: {
            warehouseVehicleId: v.id,
            status: RepairStatus.IN_PROGRESS as any,
          },
        });

        // Available actions based on status
        const actions = this.getAvailableActions(v.status);

        return {
          // Card data
          id: v.id,
          barcode: v.barcode,
          brandName: v.brandName,
          modelName: v.modelName,
          year: v.year,
          color: v.color,
          transmission: v.transmission,
          fuelType: v.fuelType,
          mileage: v.mileage,
          askingPrice: v.askingPrice,
          licensePlate: v.licensePlate,
          status: v.status,
          condition: v.condition,
          ownershipStatus: v.ownershipStatus,
          taxStatus: v.taxStatus,
          images: v.images,
          thumbnail: v.images?.length > 0 ? v.images[0] : null,
          description: v.description,
          sellerName: v.sellerName,
          listingId: v.listingId,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,

          // Location
          location: {
            city: v.locationCity || v.showroom?.city,
            province: v.locationProvince || v.showroom?.province,
          },

          // Zone info
          currentZone: currentZone
            ? {
                id: currentZone.id,
                code: currentZone.code,
                name: currentZone.name,
                type: currentZone.type,
              }
            : null,

          // Inspection summary
          latestInspection: latestInspection
            ? {
                id: latestInspection.id,
                result: latestInspection.overallResult,
                documentStatus: latestInspection.documentStatus,
                inspectedAt: latestInspection.inspectedAt,
              }
            : null,

          // Repair info
          activeRepair: activeRepair
            ? {
                id: activeRepair.id,
                type: activeRepair.repairType,
                status: activeRepair.status,
              }
            : null,

          // Available actions for this vehicle
          actions,
        };
      }),
    );

    // Summary counts per status for filter tabs
    const statusCounts = {};
    for (const s of Object.values(VehicleStatus)) {
      statusCounts[s] = await this.vehicleRepo.count({
        where: { showroomId, status: s },
      });
    }

    // Zone summary
    const zones = await this.zoneRepo.find({
      where: { showroomId, isActive: true },
      order: { code: 'ASC' },
    });

    return {
      message: 'Showroom vehicle view',
      data: {
        showroom: {
          id: showroom.id,
          name: showroom.name,
          code: showroom.code,
          city: showroom.city,
          province: showroom.province,
          logo: showroom.logo,
        },
        vehicles: enriched,
        statusCounts,
        zones: zones.map((z) => ({
          id: z.id,
          code: z.code,
          name: z.name,
          type: z.type,
          capacity: z.capacity,
          currentCount: z.currentCount,
        })),
      },
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  // ============================================================
  // FITUR: DETAIL KENDARAAN UNTUK SHOWROOM VIEW (click card)
  // Detail lengkap saat card di-klik
  // ============================================================
  async getVehicleDetailForShowroom(vehicleId: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
      relations: ['showroom', 'seller', 'variant', 'yearPrice', 'carModel'],
    });
    if (!vehicle) throw new NotFoundException('Kendaraan tidak ditemukan');

    // All inspections
    const inspections = await this.inspectionRepo.find({
      where: { warehouseVehicleId: vehicleId },
      order: { createdAt: 'DESC' },
    });

    // Current placement + zone
    const currentPlacement = await this.placementRepo.findOne({
      where: { warehouseVehicleId: vehicleId, isCurrent: true },
    });
    let currentZone = null;
    if (currentPlacement) {
      currentZone = await this.zoneRepo.findOne({
        where: { id: currentPlacement.zoneId },
      });
    }

    // Placement history
    const placementHistory = await this.placementRepo.find({
      where: { warehouseVehicleId: vehicleId },
      order: { createdAt: 'DESC' },
    });

    // Repairs
    const repairs = await this.repairRepo.find({
      where: { warehouseVehicleId: vehicleId },
      relations: ['assignedTo'],
      order: { createdAt: 'DESC' },
    });

    // Admin payment
    const adminPayment = await this.adminPaymentRepo.findOne({
      where: { warehouseVehicleId: vehicleId },
    });

    // Purchase transactions
    const purchases = await this.purchaseRepo.find({
      where: { warehouseVehicleId: vehicleId },
      relations: ['buyer'],
      order: { createdAt: 'DESC' },
    });

    // Stock logs for this vehicle
    const stockLogs = await this.stockLogRepo.find({
      where: { warehouseVehicleId: vehicleId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    // Available actions
    const actions = this.getAvailableActions(vehicle.status);

    return {
      message: 'Detail kendaraan showroom',
      data: {
        vehicle,
        currentZone,
        inspections,
        placementHistory: placementHistory.map((p) => ({
          id: p.id,
          zoneId: p.zoneId,
          action: p.action,
          isCurrent: p.isCurrent,
          placedAt: p.placedAt,
          removedAt: p.removedAt,
        })),
        repairs,
        adminPayment,
        purchases,
        stockLogs,
        actions,
      },
    };
  }

  // ============================================================
  // HELPER: Available actions berdasarkan status kendaraan
  // ============================================================
  private getAvailableActions(status: VehicleStatus): {
    key: string;
    label: string;
    method: string;
    endpoint: string;
    description: string;
  }[] {
    const actions: {
      key: string;
      label: string;
      method: string;
      endpoint: string;
      description: string;
    }[] = [];

    switch (status) {
      case VehicleStatus.INSPECTING:
        actions.push({
          key: 'submit_inspection',
          label: 'Submit Inspeksi',
          method: 'POST',
          endpoint: '/api/warehouse/inspections',
          description: 'Submit hasil inspeksi kendaraan',
        });
        break;

      case VehicleStatus.REGISTERED:
        actions.push(
          {
            key: 'place_vehicle',
            label: 'Tempatkan di Gudang',
            method: 'POST',
            endpoint: '/api/warehouse/vehicles/{id}/place',
            description: 'Tempatkan kendaraan di zona gudang',
          },
          {
            key: 'create_repair',
            label: 'Buat Work Order Repair',
            method: 'POST',
            endpoint: '/api/warehouse/repairs',
            description: 'Kirim ke bengkel untuk perbaikan',
          },
          {
            key: 'mark_ready',
            label: 'Siap Jual',
            method: 'POST',
            endpoint: '/api/warehouse/vehicles/{id}/mark-ready',
            description: 'Tandai siap jual & pindahkan ke Gudang Ready Jual',
          },
          {
            key: 'create_admin_payment',
            label: 'Bayar Admin',
            method: 'POST',
            endpoint: '/api/warehouse/payments/{id}',
            description: 'Buat invoice pembayaran admin Rp 2.000.000',
          },
        );
        break;

      case VehicleStatus.IN_WAREHOUSE:
        actions.push(
          {
            key: 'mark_ready',
            label: 'Siap Jual',
            method: 'POST',
            endpoint: '/api/warehouse/vehicles/{id}/mark-ready',
            description: 'Tandai siap jual & pindahkan ke Gudang Ready Jual',
          },
          {
            key: 'create_repair',
            label: 'Kirim ke Repair',
            method: 'POST',
            endpoint: '/api/warehouse/repairs',
            description: 'Kirim ke bengkel untuk perbaikan',
          },
          {
            key: 'move_zone',
            label: 'Pindah Zona',
            method: 'POST',
            endpoint: '/api/warehouse/vehicles/{id}/place',
            description: 'Pindahkan ke zona lain',
          },
        );
        break;

      case VehicleStatus.IN_REPAIR:
        actions.push({
          key: 'mark_ready',
          label: 'Siap Jual (Selesai Repair)',
          method: 'POST',
          endpoint: '/api/warehouse/vehicles/{id}/mark-ready',
          description: 'Tandai selesai repair & siap jual',
        });
        break;

      case VehicleStatus.PENDING_PAYMENT:
        actions.push({
          key: 'simulate_payment',
          label: 'Konfirmasi Pembayaran (Dev)',
          method: 'POST',
          endpoint: '/api/warehouse/payments/{id}/simulate-payment',
          description: 'Simulasi pembayaran berhasil (development only)',
        });
        break;

      case VehicleStatus.READY:
        actions.push({
          key: 'publish',
          label: 'Publish ke Marketplace',
          method: 'POST',
          endpoint: '/api/warehouse/vehicles/{id}/publish',
          description: 'Publikasi ke marketplace untuk dijual',
        });
        break;

      case VehicleStatus.LISTED:
        actions.push({
          key: 'view_listing',
          label: 'Lihat Listing',
          method: 'GET',
          endpoint: '/api/marketplace/listings/{listingId}',
          description: 'Lihat listing di marketplace',
        });
        break;

      case VehicleStatus.SOLD:
        // No actions for sold vehicles
        break;

      case VehicleStatus.REJECTED:
        actions.push({
          key: 're_inspect',
          label: 'Inspeksi Ulang',
          method: 'POST',
          endpoint: '/api/warehouse/inspections',
          description: 'Submit inspeksi ulang untuk kendaraan yang di-reject',
        });
        break;
    }

    return actions;
  }
}
