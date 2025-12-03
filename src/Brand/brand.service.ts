import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryGetAllDto } from '../common/query-get-all.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    // Cek apakah nama brand sudah ada
    const existing = await this.brandRepository.findOne({
      where: { name: createBrandDto.name },
    });

    if (existing) {
      throw new ConflictException('Nama brand sudah terdaftar');
    }

    const brand = this.brandRepository.create(createBrandDto);
    return this.brandRepository.save(brand);
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

  async findAll(queryDto: QueryGetAllDto) {
    const {
      page = 1,
      perPage = 10,
      search,
      orderBy = 'createdAt',
      sortDirection = 'DESC',
      isActive,
      startDate,
      endDate,
      periode,
    } = queryDto;

    const queryBuilder = this.brandRepository.createQueryBuilder('brand');

    // Filter berdasarkan search (nama)
    if (search) {
      queryBuilder.andWhere('brand.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    // Filter berdasarkan status aktif
    if (isActive !== undefined) {
      queryBuilder.andWhere('brand.isActive = :isActive', { isActive });
    }

    // Filter berdasarkan periode
    if (periode) {
      const { startDate: periodStart, endDate: periodEnd } =
        this.getDateRangeFromPeriode(periode);
      queryBuilder.andWhere(
        'brand.createdAt BETWEEN :periodStart AND :periodEnd',
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

      queryBuilder.andWhere('brand.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('brand.createdAt >= :start', { start });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('brand.createdAt <= :end', { end });
    }

    // Sorting
    const validOrderFields = ['createdAt', 'updatedAt', 'name'];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : 'createdAt';
    queryBuilder.orderBy(`brand.${orderField}`, sortDirection);

    // Pagination
    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand tidak ditemukan');
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand tidak ditemukan');
    }

    // Cek nama brand duplikat jika nama diupdate
    if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
      const existingName = await this.brandRepository.findOne({
        where: { name: updateBrandDto.name },
      });
      if (existingName) {
        throw new ConflictException('Nama brand sudah digunakan');
      }
    }

    Object.assign(brand, updateBrandDto);
    return this.brandRepository.save(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand tidak ditemukan');
    }

    await this.brandRepository.delete(id);
  }
}
