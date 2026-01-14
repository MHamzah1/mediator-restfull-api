import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import {
  BoostTransaction,
  BoostStatus,
  PaymentStatus,
  PaymentMethod,
} from '../entities/boost-transaction.entity';
import { BoostPackage } from '../entities/boost-package.entity';
import { BoostStatistic } from '../entities/boost-statistic.entity';
import { Listing } from '../entities/listing.entity';
import {
  CalculateBoostDto,
  CreateBoostOrderDto,
  QueryBoostTransactionDto,
  AdminQueryBoostTransactionDto,
} from './dto';

@Injectable()
export class BoostTransactionService {
  constructor(
    @InjectRepository(BoostTransaction)
    private boostTransactionRepository: Repository<BoostTransaction>,
    @InjectRepository(BoostPackage)
    private boostPackageRepository: Repository<BoostPackage>,
    @InjectRepository(BoostStatistic)
    private boostStatisticRepository: Repository<BoostStatistic>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
  ) {}

  // Calculate boost estimation
  async calculateBoost(dto: CalculateBoostDto) {
    const listing = await this.listingRepository.findOne({
      where: { id: dto.listingId },
      relations: ['carModel', 'carModel.brand'],
    });

    if (!listing) {
      throw new NotFoundException('Listing tidak ditemukan');
    }

    if (!listing.isActive) {
      throw new BadRequestException('Listing tidak aktif');
    }

    let packageData: BoostPackage | null = null;
    let price: number;
    let durationDays: number;
    let estimatedReachMin: number;
    let estimatedReachMax: number;
    let priorityScore: number;

    if (dto.packageId) {
      // Use predefined package
      packageData = await this.boostPackageRepository.findOne({
        where: { id: dto.packageId, isActive: true },
      });

      if (!packageData) {
        throw new NotFoundException('Paket boost tidak ditemukan');
      }

      price = Number(packageData.price);
      durationDays = packageData.durationDays;
      estimatedReachMin = packageData.estimatedReachMin;
      estimatedReachMax = packageData.estimatedReachMax;
      priorityScore = packageData.priorityScore;
    } else if (dto.customBudget && dto.customDurationDays) {
      // Custom calculation
      price = dto.customBudget;
      durationDays = dto.customDurationDays;
      
      // Calculate estimated reach based on budget
      const baseReach = 10000; // Base reach assumption
      const budgetMultiplier = price / 10000;
      const durationMultiplier = Math.sqrt(durationDays / 3);
      
      estimatedReachMin = Math.round(baseReach * budgetMultiplier * durationMultiplier * 0.7);
      estimatedReachMax = Math.round(baseReach * budgetMultiplier * durationMultiplier * 1.3);
      priorityScore = Math.round((price / 1000) * durationMultiplier);
    } else {
      throw new BadRequestException(
        'Pilih paket atau tentukan custom budget dan durasi',
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    return {
      listing: {
        id: listing.id,
        title: `${listing.carModel.brand.name} ${listing.carModel.modelName} ${listing.year}`,
        currentViews: listing.viewCount,
        image: listing.images[0] || null,
      },
      package: packageData
        ? {
            id: packageData.id,
            name: packageData.name,
            price: Number(packageData.price),
            durationDays: packageData.durationDays,
          }
        : null,
      customConfig: !packageData
        ? {
            budget: price,
            durationDays,
          }
        : null,
      estimation: {
        reachMin: estimatedReachMin,
        reachMax: estimatedReachMax,
        priorityScore,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      totalAmount: price,
      currency: 'IDR',
    };
  }

  // Create boost order
  async createBoostOrder(
    listingId: string,
    userId: string,
    dto: CreateBoostOrderDto,
  ) {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
      relations: ['carModel', 'carModel.brand'],
    });

    if (!listing) {
      throw new NotFoundException('Listing tidak ditemukan');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('Anda bukan pemilik listing ini');
    }

    if (!listing.isActive) {
      throw new BadRequestException('Listing tidak aktif');
    }

    // Check if listing already has active boost
    if (listing.isFeatured && listing.featuredUntil > new Date()) {
      throw new BadRequestException('Listing sudah memiliki boost yang aktif');
    }

    let packageData: BoostPackage | null = null;
    let amount: number;
    let durationDays: number;
    let estimatedReachMin: number;
    let estimatedReachMax: number;
    let priorityScore: number;

    if (dto.packageId) {
      packageData = await this.boostPackageRepository.findOne({
        where: { id: dto.packageId, isActive: true },
      });

      if (!packageData) {
        throw new NotFoundException('Paket boost tidak ditemukan');
      }

      amount = Number(packageData.price);
      durationDays = packageData.durationDays;
      estimatedReachMin = packageData.estimatedReachMin;
      estimatedReachMax = packageData.estimatedReachMax;
      priorityScore = packageData.priorityScore;
    } else if (dto.customBudget && dto.customDurationDays) {
      amount = dto.customBudget;
      durationDays = dto.customDurationDays;
      
      const baseReach = 10000;
      const budgetMultiplier = amount / 10000;
      const durationMultiplier = Math.sqrt(durationDays / 3);
      
      estimatedReachMin = Math.round(baseReach * budgetMultiplier * durationMultiplier * 0.7);
      estimatedReachMax = Math.round(baseReach * budgetMultiplier * durationMultiplier * 1.3);
      priorityScore = Math.round((amount / 1000) * durationMultiplier);
    } else {
      throw new BadRequestException(
        'Pilih paket atau tentukan custom budget dan durasi',
      );
    }

    // Generate payment reference
    const paymentReference = `BOOST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Set payment expiry (1 hour from now)
    const paymentExpiresAt = new Date();
    paymentExpiresAt.setHours(paymentExpiresAt.getHours() + 1);

    // Create transaction
    const transaction = this.boostTransactionRepository.create({
      listingId,
      userId,
      packageId: dto.packageId || null,
      amount,
      customDurationDays: dto.packageId ? null : durationDays,
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      paymentReference,
      paymentExpiresAt,
      estimatedReachMin,
      estimatedReachMax,
      priorityScore,
      status: BoostStatus.PENDING_PAYMENT,
    });

    const savedTransaction = await this.boostTransactionRepository.save(transaction);

    // Generate mock payment URL (replace with actual payment gateway integration)
    const paymentUrl = this.generatePaymentUrl(savedTransaction, dto.paymentMethod);

    // Update transaction with payment URL
    savedTransaction.paymentUrl = paymentUrl;
    await this.boostTransactionRepository.save(savedTransaction);

    return {
      transaction: {
        id: savedTransaction.id,
        listingId: savedTransaction.listingId,
        amount: Number(savedTransaction.amount),
        status: savedTransaction.status,
        paymentStatus: savedTransaction.paymentStatus,
        paymentMethod: savedTransaction.paymentMethod,
        createdAt: savedTransaction.createdAt,
        expiresAt: savedTransaction.paymentExpiresAt,
      },
      payment: {
        paymentUrl,
        paymentReference,
        ...(dto.paymentMethod === PaymentMethod.QRIS && {
          qrCode: `data:image/png;base64,${this.generateMockQRCode()}`,
        }),
        ...(dto.paymentMethod === PaymentMethod.BANK_TRANSFER && {
          virtualAccount: this.generateVirtualAccount(),
          bankName: 'BCA',
        }),
        instructions: this.getPaymentInstructions(dto.paymentMethod),
      },
      estimatedReach: {
        min: estimatedReachMin,
        max: estimatedReachMax,
      },
    };
  }

  // Get user's boost transactions
  async findMyTransactions(userId: string, query: QueryBoostTransactionDto) {
    const { page = 1, perPage = 10, listingId, status, paymentStatus } = query;

    const queryBuilder = this.boostTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.listing', 'listing')
      .leftJoinAndSelect('listing.carModel', 'carModel')
      .leftJoinAndSelect('carModel.brand', 'brand')
      .leftJoinAndSelect('transaction.package', 'package')
      .where('transaction.userId = :userId', { userId });

    if (listingId) {
      queryBuilder.andWhere('transaction.listingId = :listingId', { listingId });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('transaction.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      message: 'Berhasil mengambil data transaksi boost',
      data,
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  // Get single transaction
  async findOne(id: string, userId?: string) {
    const transaction = await this.boostTransactionRepository.findOne({
      where: { id },
      relations: ['listing', 'listing.carModel', 'listing.carModel.brand', 'package', 'user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    // If userId provided, check ownership
    if (userId && transaction.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke transaksi ini');
    }

    return transaction;
  }

  // Cancel pending transaction
  async cancelTransaction(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    if (transaction.status !== BoostStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Hanya transaksi pending yang bisa dibatalkan');
    }

    transaction.status = BoostStatus.CANCELLED;
    transaction.paymentStatus = PaymentStatus.EXPIRED;

    return this.boostTransactionRepository.save(transaction);
  }

  // Process payment (called by webhook or manual)
  async processPayment(paymentReference: string, paymentData: any) {
    const transaction = await this.boostTransactionRepository.findOne({
      where: { paymentReference },
      relations: ['listing'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    if (transaction.paymentStatus === PaymentStatus.PAID) {
      return { success: true, message: 'Payment already processed' };
    }

    // Verify payment amount
    if (paymentData.amount && Number(paymentData.amount) !== Number(transaction.amount)) {
      throw new BadRequestException('Payment amount mismatch');
    }

    // Update transaction
    transaction.paymentStatus = PaymentStatus.PAID;
    transaction.paidAt = new Date();
    
    // Set boost dates
    const startDate = new Date();
    const endDate = new Date();
    const durationDays = transaction.customDurationDays || 
      (transaction.package ? transaction.package.durationDays : 3);
    endDate.setDate(endDate.getDate() + durationDays);

    transaction.startDate = startDate;
    transaction.endDate = endDate;
    transaction.status = BoostStatus.ACTIVE;

    await this.boostTransactionRepository.save(transaction);

    // Update listing to featured
    await this.listingRepository.update(transaction.listingId, {
      isFeatured: true,
      featuredUntil: endDate,
      featuredPriority: transaction.priorityScore,
      currentBoostId: transaction.id,
    });

    return {
      success: true,
      message: 'Payment processed successfully',
      transaction: {
        id: transaction.id,
        status: transaction.status,
        startDate: transaction.startDate,
        endDate: transaction.endDate,
      },
    };
  }

  // Get transaction statistics
  async getTransactionStatistics(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    if (transaction.status !== BoostStatus.ACTIVE && transaction.status !== BoostStatus.EXPIRED) {
      throw new BadRequestException('Statistik hanya tersedia untuk boost aktif atau selesai');
    }

    // Get daily statistics
    const dailyStats = await this.boostStatisticRepository.find({
      where: { boostTransactionId: id },
      order: { date: 'ASC' },
    });

    // Calculate totals
    const totalImpressions = dailyStats.reduce((sum, s) => sum + s.impressions, 0);
    const totalClicks = dailyStats.reduce((sum, s) => sum + s.clicks, 0);
    const totalContactClicks = dailyStats.reduce((sum, s) => sum + s.contactClicks, 0);

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(transaction.endDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      transaction: {
        id: transaction.id,
        status: transaction.status,
        startDate: transaction.startDate,
        endDate: transaction.endDate,
        daysRemaining,
      },
      estimation: {
        reachMin: transaction.estimatedReachMin,
        reachMax: transaction.estimatedReachMax,
      },
      actual: {
        totalImpressions,
        totalClicks,
        totalContactClicks,
        clickThroughRate: totalImpressions > 0 
          ? `${((totalClicks / totalImpressions) * 100).toFixed(2)}%` 
          : '0%',
        contactRate: totalClicks > 0 
          ? `${((totalContactClicks / totalClicks) * 100).toFixed(2)}%` 
          : '0%',
      },
      daily: dailyStats.map(s => ({
        date: s.date,
        impressions: s.impressions,
        clicks: s.clicks,
        contactClicks: s.contactClicks,
      })),
    };
  }

  // Expire ended boosts (called by scheduler)
  async expireEndedBoosts() {
    const now = new Date();

    // Find active boosts that have ended
    const expiredBoosts = await this.boostTransactionRepository.find({
      where: {
        status: BoostStatus.ACTIVE,
        endDate: LessThan(now),
      },
    });

    for (const boost of expiredBoosts) {
      boost.status = BoostStatus.EXPIRED;
      boost.expiredAt = now;
      await this.boostTransactionRepository.save(boost);

      // Update listing
      await this.listingRepository.update(boost.listingId, {
        isFeatured: false,
        featuredUntil: null,
        featuredPriority: 0,
        currentBoostId: null,
      });
    }

    return { expiredCount: expiredBoosts.length };
  }

  // Expire unpaid transactions (called by scheduler)
  async expireUnpaidTransactions() {
    const now = new Date();

    const expiredTransactions = await this.boostTransactionRepository.find({
      where: {
        status: BoostStatus.PENDING_PAYMENT,
        paymentExpiresAt: LessThan(now),
      },
    });

    for (const transaction of expiredTransactions) {
      transaction.status = BoostStatus.CANCELLED;
      transaction.paymentStatus = PaymentStatus.EXPIRED;
      await this.boostTransactionRepository.save(transaction);
    }

    return { expiredCount: expiredTransactions.length };
  }

  // Record impression (called when listing is viewed)
  async recordImpression(listingId: string) {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
    });

    if (!listing || !listing.isFeatured || !listing.currentBoostId) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let statistic = await this.boostStatisticRepository.findOne({
      where: {
        boostTransactionId: listing.currentBoostId,
        date: today,
      },
    });

    if (!statistic) {
      statistic = this.boostStatisticRepository.create({
        boostTransactionId: listing.currentBoostId,
        date: today,
        impressions: 0,
        clicks: 0,
        contactClicks: 0,
      });
    }

    statistic.impressions++;
    await this.boostStatisticRepository.save(statistic);

    // Update actual reach in transaction
    await this.boostTransactionRepository.increment(
      { id: listing.currentBoostId },
      'actualReach',
      1,
    );
  }

  // Record click (called when listing detail is viewed)
  async recordClick(listingId: string) {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
    });

    if (!listing || !listing.isFeatured || !listing.currentBoostId) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let statistic = await this.boostStatisticRepository.findOne({
      where: {
        boostTransactionId: listing.currentBoostId,
        date: today,
      },
    });

    if (statistic) {
      statistic.clicks++;
      await this.boostStatisticRepository.save(statistic);
    }
  }

  // Record contact click
  async recordContactClick(listingId: string) {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
    });

    if (!listing || !listing.isFeatured || !listing.currentBoostId) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let statistic = await this.boostStatisticRepository.findOne({
      where: {
        boostTransactionId: listing.currentBoostId,
        date: today,
      },
    });

    if (statistic) {
      statistic.contactClicks++;
      await this.boostStatisticRepository.save(statistic);
    }
  }

  // ============ ADMIN METHODS ============

  async adminFindAll(query: AdminQueryBoostTransactionDto) {
    const { page = 1, perPage = 10, userId, listingId, status, paymentStatus } = query;

    const queryBuilder = this.boostTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.listing', 'listing')
      .leftJoinAndSelect('listing.carModel', 'carModel')
      .leftJoinAndSelect('carModel.brand', 'brand')
      .leftJoinAndSelect('transaction.package', 'package')
      .leftJoinAndSelect('transaction.user', 'user');

    if (userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId });
    }

    if (listingId) {
      queryBuilder.andWhere('transaction.listingId = :listingId', { listingId });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('transaction.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      message: 'Berhasil mengambil semua transaksi boost',
      data,
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async adminGetStatistics() {
    const totalTransactions = await this.boostTransactionRepository.count();
    const paidTransactions = await this.boostTransactionRepository.count({
      where: { paymentStatus: PaymentStatus.PAID },
    });
    const activeBoosts = await this.boostTransactionRepository.count({
      where: { status: BoostStatus.ACTIVE },
    });

    // Calculate total revenue
    const revenueResult = await this.boostTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.paymentStatus = :status', { status: PaymentStatus.PAID })
      .getRawOne();

    // Get revenue by package
    const revenueByPackage = await this.boostTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.package', 'package')
      .select('package.name', 'packageName')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'total')
      .where('transaction.paymentStatus = :status', { status: PaymentStatus.PAID })
      .groupBy('package.name')
      .getRawMany();

    return {
      overview: {
        totalTransactions,
        paidTransactions,
        activeBoosts,
        totalRevenue: Number(revenueResult?.total || 0),
      },
      revenueByPackage,
    };
  }

  async adminUpdateStatus(id: string, status: BoostStatus) {
    const transaction = await this.boostTransactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    transaction.status = status;

    if (status === BoostStatus.ACTIVE) {
      // Activate boost
      const startDate = new Date();
      const endDate = new Date();
      const durationDays = transaction.customDurationDays || 
        (transaction.package ? transaction.package.durationDays : 3);
      endDate.setDate(endDate.getDate() + durationDays);

      transaction.startDate = startDate;
      transaction.endDate = endDate;
      transaction.paymentStatus = PaymentStatus.PAID;
      transaction.paidAt = new Date();

      await this.listingRepository.update(transaction.listingId, {
        isFeatured: true,
        featuredUntil: endDate,
        featuredPriority: transaction.priorityScore,
        currentBoostId: transaction.id,
      });
    } else if (status === BoostStatus.EXPIRED || status === BoostStatus.CANCELLED) {
      // Deactivate boost
      transaction.expiredAt = new Date();

      await this.listingRepository.update(transaction.listingId, {
        isFeatured: false,
        featuredUntil: null,
        featuredPriority: 0,
        currentBoostId: null,
      });
    }

    return this.boostTransactionRepository.save(transaction);
  }

  // ============ HELPER METHODS ============

  private generatePaymentUrl(transaction: BoostTransaction, method: PaymentMethod): string {
    // Mock payment URL - replace with actual payment gateway integration
    const baseUrl = process.env.PAYMENT_GATEWAY_URL || 'https://payment.example.com';
    return `${baseUrl}/pay/${transaction.paymentReference}?method=${method}`;
  }

  private generateMockQRCode(): string {
    // Return a mock base64 QR code - replace with actual QR generation
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  private generateVirtualAccount(): string {
    // Generate mock virtual account number
    return `888${Math.random().toString().substr(2, 10)}`;
  }

  private getPaymentInstructions(method: PaymentMethod): string[] {
    switch (method) {
      case PaymentMethod.EWALLET:
        return [
          'Buka aplikasi e-wallet Anda',
          'Scan QR code atau klik link pembayaran',
          'Konfirmasi pembayaran',
          'Boost akan aktif setelah pembayaran berhasil',
        ];
      case PaymentMethod.BANK_TRANSFER:
        return [
          'Transfer ke nomor Virtual Account yang tertera',
          'Pastikan jumlah transfer sesuai',
          'Simpan bukti transfer',
          'Boost akan aktif dalam 1-5 menit setelah transfer berhasil',
        ];
      case PaymentMethod.CREDIT_CARD:
        return [
          'Masukkan detail kartu kredit Anda',
          'Verifikasi dengan OTP',
          'Boost akan aktif setelah pembayaran berhasil',
        ];
      case PaymentMethod.QRIS:
        return [
          'Buka aplikasi mobile banking atau e-wallet',
          'Pilih menu Scan QR / QRIS',
          'Scan QR code yang ditampilkan',
          'Konfirmasi pembayaran',
        ];
      default:
        return ['Ikuti instruksi pembayaran'];
    }
  }
}
