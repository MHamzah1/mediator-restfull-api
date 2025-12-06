import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomPrice } from '../entities/custom-price.entity';
import { CarModel } from '../entities/car-model.entity';
import { CreateCustomPriceDto } from './dto/create-custom-price.dto';
import { UpdateCustomPriceDto } from './dto/update-custom-price.dto';
import { QueryCustomPriceDto } from './dto/query-custom-price.dto';

@Injectable()
export class CustomPriceService {
  constructor(
    @InjectRepository(CustomPrice)
    private customPriceRepository: Repository<CustomPrice>,
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
  ) {}

  async create(
    createCustomPriceDto: CreateCustomPriceDto,
  ): Promise<CustomPrice> {
    // Cek apakah car model exists
    const carModel = await this.carModelRepository.findOne({
      where: { id: createCustomPriceDto.modelId },
    });

    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    const customPrice = this.customPriceRepository.create(createCustomPriceDto);
    return this.customPriceRepository.save(customPrice);
  }

  async findAll(queryDto: QueryCustomPriceDto) {
    const { page = 1, pageSize = 10, modelId, isActive } = queryDto;

    const queryBuilder =
      this.customPriceRepository.createQueryBuilder('customPrice');

    // Join dengan car model
    queryBuilder.leftJoinAndSelect('customPrice.carModel', 'carModel');

    // Filter berdasarkan modelId
    if (modelId) {
      queryBuilder.andWhere('customPrice.modelId = :modelId', { modelId });
    }

    // Filter berdasarkan status aktif
    if (isActive !== undefined) {
      queryBuilder.andWhere('customPrice.isActive = :isActive', { isActive });
    }

    // Sorting default by createdAt DESC
    queryBuilder.orderBy('customPrice.createdAt', 'DESC');

    // Pagination
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    // Format response dengan modelName
    const formattedData = data.map((price) => ({
      id: price.id,
      modelId: price.modelId,
      modelName: price.carModel?.modelName || null,
      priceName: price.priceName,
      priceType: price.priceType,
      priceValue: parseFloat(price.priceValue.toString()),
      description: price.description,
      isActive: price.isActive,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        pageSize,
        totalRecords: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findByModelId(modelId: string, queryDto: QueryCustomPriceDto) {
    // Cek apakah car model exists
    const carModel = await this.carModelRepository.findOne({
      where: { id: modelId },
    });

    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    const { page = 1, pageSize = 10 } = queryDto;

    const queryBuilder =
      this.customPriceRepository.createQueryBuilder('customPrice');

    // Join dengan car model
    queryBuilder.leftJoinAndSelect('customPrice.carModel', 'carModel');

    // Filter by modelId
    queryBuilder.andWhere('customPrice.modelId = :modelId', { modelId });

    // Sorting default by createdAt DESC
    queryBuilder.orderBy('customPrice.createdAt', 'DESC');

    // Pagination
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    // Format response dengan modelName
    const formattedData = data.map((price) => ({
      id: price.id,
      modelId: price.modelId,
      modelName: price.carModel?.modelName || null,
      priceName: price.priceName,
      priceType: price.priceType,
      priceValue: parseFloat(price.priceValue.toString()),
      description: price.description,
      isActive: price.isActive,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        pageSize,
        totalRecords: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const customPrice = await this.customPriceRepository.findOne({
      where: { id },
      relations: ['carModel'],
    });

    if (!customPrice) {
      throw new NotFoundException('Custom price tidak ditemukan');
    }

    return {
      id: customPrice.id,
      modelId: customPrice.modelId,
      modelName: customPrice.carModel?.modelName || null,
      priceName: customPrice.priceName,
      priceType: customPrice.priceType,
      priceValue: parseFloat(customPrice.priceValue.toString()),
      description: customPrice.description,
      isActive: customPrice.isActive,
      createdAt: customPrice.createdAt,
      updatedAt: customPrice.updatedAt,
    };
  }

  async update(
    id: string,
    updateCustomPriceDto: UpdateCustomPriceDto,
  ): Promise<CustomPrice> {
    const customPrice = await this.customPriceRepository.findOne({
      where: { id },
    });

    if (!customPrice) {
      throw new NotFoundException('Custom price tidak ditemukan');
    }

    // Jika modelId diubah, cek apakah model baru exists
    if (
      updateCustomPriceDto.modelId &&
      updateCustomPriceDto.modelId !== customPrice.modelId
    ) {
      const carModel = await this.carModelRepository.findOne({
        where: { id: updateCustomPriceDto.modelId },
      });

      if (!carModel) {
        throw new NotFoundException('Model mobil tidak ditemukan');
      }
    }

    Object.assign(customPrice, updateCustomPriceDto);
    return this.customPriceRepository.save(customPrice);
  }

  async remove(id: string): Promise<void> {
    const customPrice = await this.customPriceRepository.findOne({
      where: { id },
    });

    if (!customPrice) {
      throw new NotFoundException('Custom price tidak ditemukan');
    }

    await this.customPriceRepository.delete(id);
  }
}
