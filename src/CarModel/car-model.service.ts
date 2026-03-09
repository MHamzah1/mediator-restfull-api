import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarModel } from '../entities/car-model.entity';
import { Brand } from '../entities/brand.entity';
import { CreateCarModelDto } from './dto/create-car-model.dto';
import { UpdateCarModelDto } from './dto/update-car-model.dto';
import { QueryGetAllModelDto } from './dto/query-get-all-model.dto';

@Injectable()
export class CarModelService {
  constructor(
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async create(
    createCarModelDto: CreateCarModelDto,
  ): Promise<{ message: string; data: CarModel }> {
    // Cek apakah brand exists
    const brand = await this.brandRepository.findOne({
      where: { id: createCarModelDto.brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand tidak ditemukan');
    }

    const carModel = this.carModelRepository.create(createCarModelDto);
    const savedCarModel = await this.carModelRepository.save(carModel);

    return {
      message: 'Model mobil berhasil dibuat',
      data: savedCarModel,
    };
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

  async findAll(queryDto: QueryGetAllModelDto) {
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
      brandId,
    } = queryDto;

    const queryBuilder = this.carModelRepository.createQueryBuilder('carModel');

    // Join dengan brand
    queryBuilder.leftJoinAndSelect('carModel.brand', 'brand');

    // Filter berdasarkan search (model name atau brand name)
    if (search) {
      queryBuilder.andWhere(
        '(carModel.modelName ILIKE :search OR brand.name ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Filter berdasarkan status aktif
    if (isActive !== undefined) {
      queryBuilder.andWhere('carModel.isActive = :isActive', { isActive });
    }

    // Filter berdasarkan brandId
    if (brandId) {
      queryBuilder.andWhere('carModel.brandId = :brandId', { brandId });
    }
    // Filter berdasarkan periode
    if (periode) {
      const { startDate: periodStart, endDate: periodEnd } =
        this.getDateRangeFromPeriode(periode);
      queryBuilder.andWhere(
        'carModel.createdAt BETWEEN :periodStart AND :periodEnd',
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

      queryBuilder.andWhere('carModel.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('carModel.createdAt >= :start', { start });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('carModel.createdAt <= :end', { end });
    }

    // Sorting
    const validOrderFields = [
      'createdAt',
      'updatedAt',
      'modelName',
      'basePrice',
    ];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : 'createdAt';
    queryBuilder.orderBy(`carModel.${orderField}`, sortDirection);

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

  async findOne(id: string): Promise<CarModel> {
    const carModel = await this.carModelRepository.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    return carModel;
  }

  async update(
    id: string,
    updateCarModelDto: UpdateCarModelDto,
  ): Promise<CarModel> {
    const carModel = await this.carModelRepository.findOne({
      where: { id },
    });

    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    Object.assign(carModel, updateCarModelDto);
    return this.carModelRepository.save(carModel);
  }

  async remove(id: string): Promise<{ message: string }> {
    const carModel = await this.carModelRepository.findOne({
      where: { id },
    });

    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    await this.carModelRepository.delete(id);

    return {
      message: 'Model mobil berhasil dihapus',
    };
  }
}
