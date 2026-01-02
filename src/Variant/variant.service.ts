import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variant } from '../entities/variant.entity';
import { CarModel } from '../entities/car-model.entity';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { QueryVariantDto } from './dto/query-variant.dto';

@Injectable()
export class VariantService {
  constructor(
    @InjectRepository(Variant)
    private variantRepository: Repository<Variant>,
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
  ) {}

  async create(createVariantDto: CreateVariantDto) {
    // Cek model exists
    const carModel = await this.carModelRepository.findOne({
      where: { id: createVariantDto.modelId },
    });
    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    // Cek variantCode unique
    const existingCode = await this.variantRepository.findOne({
      where: { variantCode: createVariantDto.variantCode },
    });
    if (existingCode) {
      throw new ConflictException('Kode variant sudah digunakan');
    }

    // Cek variantName unique dalam model yang sama
    const existingName = await this.variantRepository.findOne({
      where: {
        modelId: createVariantDto.modelId,
        variantName: createVariantDto.variantName,
      },
    });
    if (existingName) {
      throw new ConflictException('Nama variant sudah ada dalam model yang sama');
    }

    const variant = this.variantRepository.create(createVariantDto);
    const saved = await this.variantRepository.save(variant);

    return {
      message: 'Variant berhasil dibuat',
      data: await this.findOne(saved.id),
    };
  }

  async findAll(queryDto: QueryVariantDto) {
    const {
      page = 1,
      perPage = 10,
      search,
      orderBy = 'sortOrder',
      sortDirection = 'ASC',
      isActive,
      modelId,
    } = queryDto;

    const qb = this.variantRepository.createQueryBuilder('variant')
      .leftJoinAndSelect('variant.model', 'model')
      .leftJoinAndSelect('model.brand', 'brand');

    if (modelId) {
      qb.andWhere('variant.modelId = :modelId', { modelId });
    }

    if (search) {
      qb.andWhere(
        '(variant.variantName ILIKE :search OR variant.variantCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      qb.andWhere('variant.isActive = :isActive', { isActive });
    }

    const validFields = ['createdAt', 'updatedAt', 'variantName', 'variantCode', 'sortOrder'];
    const order = validFields.includes(orderBy) ? orderBy : 'sortOrder';
    qb.orderBy(`variant.${order}`, sortDirection);

    const skip = (page - 1) * perPage;
    qb.skip(skip).take(perPage);

    const [data, total] = await qb.getManyAndCount();

    const transformedData = data.map((v) => ({
      id: v.id,
      modelId: v.modelId,
      modelName: v.model?.modelName,
      brandName: v.model?.brand?.name,
      variantName: v.variantName,
      variantCode: v.variantCode,
      description: v.description,
      transmissionType: v.transmissionType,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    return {
      data: transformedData,
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findByModelId(modelId: string, queryDto: QueryVariantDto) {
    const carModel = await this.carModelRepository.findOne({
      where: { id: modelId },
    });
    if (!carModel) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    queryDto.modelId = modelId;
    return this.findAll(queryDto);
  }

  async findOne(id: string) {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['model', 'model.brand'],
    });

    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    return {
      id: variant.id,
      modelId: variant.modelId,
      modelName: variant.model?.modelName,
      brandName: variant.model?.brand?.name,
      variantName: variant.variantName,
      variantCode: variant.variantCode,
      description: variant.description,
      transmissionType: variant.transmissionType,
      sortOrder: variant.sortOrder,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }

  async update(id: string, updateVariantDto: UpdateVariantDto) {
    const variant = await this.variantRepository.findOne({ where: { id } });
    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    if (updateVariantDto.variantCode && updateVariantDto.variantCode !== variant.variantCode) {
      const existing = await this.variantRepository.findOne({
        where: { variantCode: updateVariantDto.variantCode },
      });
      if (existing) {
        throw new ConflictException('Kode variant sudah digunakan');
      }
    }

    Object.assign(variant, updateVariantDto);
    await this.variantRepository.save(variant);

    return {
      message: 'Variant berhasil diupdate',
      data: await this.findOne(id),
    };
  }

  async remove(id: string) {
    const variant = await this.variantRepository.findOne({ where: { id } });
    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    await this.variantRepository.delete(id);
    return { message: 'Variant berhasil dihapus' };
  }
}
