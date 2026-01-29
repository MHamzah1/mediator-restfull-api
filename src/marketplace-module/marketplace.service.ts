import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarModel } from '../entities/car-model.entity';
import { User } from '../entities/user.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilterListingDto } from './dto/filter-listing.dto';
import { Listing } from 'src/entities/listing.entity';
import {
  deleteFromS3,
  getS3KeyFromUrl,
  MulterS3File,
} from 'src/config/s3.config';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Helper untuk menghasilkan URL gambar dari S3
  private generateImageUrls(files: MulterS3File[]): string[] {
    // Simpan URL lengkap dari S3
    return files.map((file) => file.location);
  }

  private async deleteFiles(filePaths: string[]): Promise<void> {
    // Hapus file dari S3
    for (const filePath of filePaths) {
      const key = getS3KeyFromUrl(filePath);
      await deleteFromS3(key);
    }
  }

  // Helper untuk menghitung date range berdasarkan periode
  private getDateRangeFromPeriode(periode: string): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (periode) {
      case 'Today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'ThisWeek':
        const firstDayOfWeek = now.getDate() - now.getDay();
        startDate.setDate(firstDayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'LastWeek':
        const firstDayOfLastWeek = now.getDate() - now.getDay() - 7;
        const lastDayOfLastWeek = firstDayOfLastWeek + 6;
        startDate.setDate(firstDayOfLastWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(lastDayOfLastWeek);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'ThisMonth':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'LastMonth':
        startDate.setMonth(startDate.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'ThisYear':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'LastYear':
        startDate.setFullYear(startDate.getFullYear() - 1, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setFullYear(endDate.getFullYear() - 1, 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'Last3Months':
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'Last6Months':
        startDate.setMonth(startDate.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  async create(
    userId: string,
    createListingDto: CreateListingDto,
    files: MulterS3File[],
  ): Promise<{ message: string; data: Listing }> {
    const carModel = await this.carModelRepository.findOne({
      where: { id: createListingDto.carModelId },
      relations: ['brand'],
    });

    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    if (!carModel.isActive) {
      throw new BadRequestException('Model mobil tidak aktif');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Generate image URLs dari uploaded files
    const imageUrls = this.generateImageUrls(files);

    const listing = this.listingRepository.create({
      ...createListingDto,
      sellerId: userId,
      images: imageUrls,
    });

    const savedListing = await this.listingRepository.save(listing);

    return {
      message: 'Listing berhasil dibuat',
      data: savedListing,
    };
  }

  async findAll(filterDto: FilterListingDto) {
    const {
      page = 1,
      perPage = 20,
      search,
      orderBy = 'createdAt',
      sortDirection = 'DESC',
      isActive,
      brandId,
      carModelId,
      minPrice,
      maxPrice,
      yearMin,
      yearMax,
      transmission,
      fuelType,
      locationCity,
      locationProvince,
      condition,
      startDate,
      endDate,
      periode,
      sortBy,
    } = filterDto;

    const queryBuilder = this.listingRepository.createQueryBuilder('listing');

    // Join dengan carModel, brand, dan seller
    queryBuilder
      .leftJoinAndSelect('listing.carModel', 'carModel')
      .leftJoinAndSelect('carModel.brand', 'brand')
      .leftJoinAndSelect('listing.seller', 'seller');

    // Filter berdasarkan search (brand name, model name, atau deskripsi)
    if (search) {
      queryBuilder.andWhere(
        '(brand.name LIKE :search OR carModel.modelName LIKE :search OR listing.description LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Filter berdasarkan status aktif
    if (isActive !== undefined) {
      queryBuilder.andWhere('listing.isActive = :isActive', { isActive });
    }

    // Filter berdasarkan brand
    if (brandId) {
      queryBuilder.andWhere('brand.id = :brandId', { brandId });
    }

    // Filter berdasarkan car model
    if (carModelId) {
      queryBuilder.andWhere('listing.carModelId = :carModelId', {
        carModelId,
      });
    }

    // Filter berdasarkan price range
    if (minPrice) {
      queryBuilder.andWhere('listing.price >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      queryBuilder.andWhere('listing.price <= :maxPrice', { maxPrice });
    }

    // Filter berdasarkan year range
    if (yearMin) {
      queryBuilder.andWhere('listing.year >= :yearMin', { yearMin });
    }
    if (yearMax) {
      queryBuilder.andWhere('listing.year <= :yearMax', { yearMax });
    }

    // Filter berdasarkan transmission
    if (transmission) {
      queryBuilder.andWhere('listing.transmission = :transmission', {
        transmission,
      });
    }

    // Filter berdasarkan fuel type
    if (fuelType) {
      queryBuilder.andWhere('listing.fuelType = :fuelType', { fuelType });
    }

    // Filter berdasarkan location city
    if (locationCity) {
      queryBuilder.andWhere('listing.locationCity LIKE :locationCity', {
        locationCity: `%${locationCity}%`,
      });
    }

    // Filter berdasarkan location province
    if (locationProvince) {
      queryBuilder.andWhere('listing.locationProvince LIKE :locationProvince', {
        locationProvince: `%${locationProvince}%`,
      });
    }

    // Filter berdasarkan condition
    if (condition) {
      queryBuilder.andWhere('listing.condition = :condition', { condition });
    }

    // Filter berdasarkan periode
    if (periode) {
      const { startDate: periodStart, endDate: periodEnd } =
        this.getDateRangeFromPeriode(periode);
      queryBuilder.andWhere(
        'listing.createdAt BETWEEN :periodStart AND :periodEnd',
        {
          periodStart,
          periodEnd,
        },
      );
    }
    // Filter berdasarkan startDate dan endDate manual
    else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      queryBuilder.andWhere('listing.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('listing.createdAt >= :start', { start });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('listing.createdAt <= :end', { end });
    }

    // FEATURED FIRST: Always prioritize featured listings
    // Featured listings dengan featuredUntil > now akan muncul pertama
    queryBuilder.addSelect(
      `CASE WHEN listing.isFeatured = true AND listing.featuredUntil > NOW() THEN 0 ELSE 1 END`,
      'ASC',
    );
    // Then sort by featured priority (higher priority first)
    queryBuilder.addOrderBy('listing.featuredPriority', 'DESC');

    // Sorting preset atau manual (secondary sort)
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          queryBuilder.addOrderBy('listing.price', 'ASC');
          break;
        case 'price_desc':
          queryBuilder.addOrderBy('listing.price', 'DESC');
          break;
        case 'newest':
          queryBuilder.addOrderBy('listing.createdAt', 'DESC');
          break;
        case 'oldest':
          queryBuilder.addOrderBy('listing.createdAt', 'ASC');
          break;
        case 'mileage':
          queryBuilder.addOrderBy('listing.mileage', 'ASC');
          break;
        default:
          queryBuilder.addOrderBy('listing.createdAt', 'DESC');
      }
    } else {
      // Manual sorting
      const validOrderFields = [
        'createdAt',
        'updatedAt',
        'price',
        'year',
        'mileage',
      ];
      const orderField = validOrderFields.includes(orderBy)
        ? orderBy
        : 'createdAt';
      queryBuilder.addOrderBy(`listing.${orderField}`, sortDirection);
    }

    // Pagination
    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      message: 'Berhasil mengambil data listing',
      data,
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string): Promise<{ message: string; data: Listing }> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['carModel', 'carModel.brand', 'seller'],
    });

    if (!listing) {
      throw new NotFoundException('Listing tidak ditemukan');
    }

    // Increment view count
    await this.listingRepository.update(id, {
      viewCount: listing.viewCount + 1,
    });

    return {
      message: 'Berhasil mengambil detail listing',
      data: listing,
    };
  }

  async update(
    id: string,
    userId: string,
    updateListingDto: UpdateListingDto,
    files?: MulterS3File[],
  ): Promise<{ message: string; data: Listing }> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['carModel', 'carModel.brand', 'seller'],
    });

    if (!listing) {
      throw new NotFoundException('Listing tidak ditemukan');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk mengupdate listing ini',
      );
    }

    // Jika ada file baru diupload
    if (files && files.length > 0) {
      // Hapus gambar lama dari S3
      await this.deleteFiles(listing.images);

      // Generate URL gambar baru
      const newImageUrls = this.generateImageUrls(files);
      updateListingDto.images = newImageUrls;
    }

    Object.assign(listing, updateListingDto);
    const updatedListing = await this.listingRepository.save(listing);

    return {
      message: 'Listing berhasil diupdate',
      data: updatedListing,
    };
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<{ message: string; deletedId: string }> {
    const listing = await this.listingRepository.findOne({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing tidak ditemukan');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk menghapus listing ini',
      );
    }

    // Hapus file gambar dari S3
    await this.deleteFiles(listing.images);

    await this.listingRepository.delete(id);

    return {
      message: 'Listing berhasil dihapus',
      deletedId: id,
    };
  }

  async getMyListings(
    userId: string,
    filterDto: FilterListingDto,
  ): Promise<any> {
    const {
      page = 1,
      perPage = 20,
      isActive,
      orderBy = 'createdAt',
      sortDirection = 'DESC',
    } = filterDto;

    const queryBuilder = this.listingRepository.createQueryBuilder('listing');

    // Filter by seller
    queryBuilder.where('listing.sellerId = :userId', { userId });

    // Join dengan carModel dan brand
    queryBuilder
      .leftJoinAndSelect('listing.carModel', 'carModel')
      .leftJoinAndSelect('carModel.brand', 'brand');

    // Filter berdasarkan status aktif
    if (isActive !== undefined) {
      queryBuilder.andWhere('listing.isActive = :isActive', { isActive });
    }

    // Sorting
    const validOrderFields = [
      'createdAt',
      'updatedAt',
      'price',
      'year',
      'mileage',
    ];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : 'createdAt';
    queryBuilder.orderBy(`listing.${orderField}`, sortDirection);

    // Pagination
    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    // Calculate summary
    const activeCount = await this.listingRepository.count({
      where: { sellerId: userId, isActive: true },
    });
    const inactiveCount = await this.listingRepository.count({
      where: { sellerId: userId, isActive: false },
    });

    const allListings = await this.listingRepository.find({
      where: { sellerId: userId },
    });

    const totalViews = allListings.reduce(
      (sum, listing) => sum + listing.viewCount,
      0,
    );
    const totalContactClicks = allListings.reduce(
      (sum, listing) => sum + listing.contactClickCount,
      0,
    );

    return {
      message: 'Berhasil mengambil listing saya',
      data,
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
      summary: {
        totalActiveListings: activeCount,
        totalInactiveListings: inactiveCount,
        totalViews,
        totalContactClicks,
      },
    };
  }

  async generateWhatsappLink(id: string): Promise<{
    message: string;
    whatsappUrl: string;
    sellerPhone: string;
    preFilledMessage: string;
    seller: any;
    listing: any;
  }> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['carModel', 'carModel.brand', 'seller'],
    });

    if (!listing) {
      throw new NotFoundException('Listing tidak ditemukan');
    }

    if (!listing.isActive) {
      throw new BadRequestException('Listing tidak aktif');
    }

    // Generate pre-filled message
    const formattedPrice = new Intl.NumberFormat('id-ID').format(
      Number(listing.price),
    );
    const preFilledMessage = `Halo, saya tertarik dengan mobil ${listing.carModel.brand.name} ${listing.carModel.modelName} ${listing.year} seharga Rp ${formattedPrice}. Apakah masih tersedia?`;

    const encodedMessage = encodeURIComponent(preFilledMessage);
    const whatsappUrl = `https://wa.me/${listing.sellerWhatsapp}?text=${encodedMessage}`;

    // Increment contact click count
    await this.listingRepository.update(id, {
      contactClickCount: listing.contactClickCount + 1,
    });

    return {
      message: 'Link WhatsApp berhasil di-generate',
      whatsappUrl,
      sellerPhone: listing.sellerWhatsapp,
      preFilledMessage,
      seller: {
        name: listing.seller.fullName,
        location: `${listing.locationCity}, ${listing.locationProvince}`,
      },
      listing: {
        id: listing.id,
        carBrand: listing.carModel.brand.name,
        carModel: listing.carModel.modelName,
        year: listing.year,
        price: listing.price,
      },
    };
  }

  // ============ FEATURED LISTINGS METHODS ============

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findFeatured(limit: number = 10, category?: string) {
    const now = new Date();

    const queryBuilder = this.listingRepository.createQueryBuilder('listing');

    // Join dengan carModel, brand, dan seller
    queryBuilder
      .leftJoinAndSelect('listing.carModel', 'carModel')
      .leftJoinAndSelect('carModel.brand', 'brand')
      .leftJoinAndSelect('listing.seller', 'seller');

    // Only active listings
    queryBuilder.andWhere('listing.isActive = :isActive', { isActive: true });

    // Only featured listings with valid featuredUntil
    queryBuilder.andWhere('listing.isFeatured = :isFeatured', {
      isFeatured: true,
    });
    queryBuilder.andWhere('listing.featuredUntil > :now', { now });

    // Filter by category if provided (based on car type/category if you have it)
    // This can be expanded based on your data model

    // Order by priority (higher first), then by featuredUntil (ending soon first)
    queryBuilder.orderBy('listing.featuredPriority', 'DESC');
    queryBuilder.addOrderBy('listing.featuredUntil', 'ASC');

    // Limit results
    queryBuilder.take(limit);

    const data = await queryBuilder.getMany();

    // Add featured badge info
    const dataWithBadge = data.map((listing) => ({
      ...listing,
      featuredBadge: this.getFeaturedBadge(listing.featuredPriority),
    }));

    return {
      message: 'Berhasil mengambil mobil unggulan',
      data: dataWithBadge,
      total: data.length,
    };
  }

  private getFeaturedBadge(priority: number): string {
    if (priority >= 50) return 'Premium';
    if (priority >= 30) return 'Unggulan';
    if (priority >= 10) return 'Populer';
    return 'Featured';
  }

  // Method to check and update expired featured status
  async checkAndExpireFeaturedListings() {
    const now = new Date();

    // Find listings where featuredUntil has passed but isFeatured is still true
    const expiredListings = await this.listingRepository
      .createQueryBuilder('listing')
      .where('listing.isFeatured = :isFeatured', { isFeatured: true })
      .andWhere('listing.featuredUntil < :now', { now })
      .getMany();

    // Update expired listings
    for (const listing of expiredListings) {
      await this.listingRepository.update(listing.id, {
        isFeatured: false,
        featuredUntil: null,
        featuredPriority: 0,
        currentBoostId: null,
      });
    }

    return { expiredCount: expiredListings.length };
  }
}
