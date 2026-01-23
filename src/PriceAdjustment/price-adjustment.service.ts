import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PriceAdjustment,
  AdjustmentCategory,
  AdjustmentType,
} from '../entities/price-adjustment.entity';
import { CarModel } from '../entities/car-model.entity';
import {
  CreatePriceAdjustmentDto,
  BulkCreatePriceAdjustmentDto,
} from './dto/create-price-adjustment.dto';
import { UpdatePriceAdjustmentDto } from './dto/update-price-adjustment.dto';
import { QueryPriceAdjustmentDto } from './dto/query-price-adjustment.dto';

@Injectable()
export class PriceAdjustmentService {
  constructor(
    @InjectRepository(PriceAdjustment)
    private priceAdjustmentRepository: Repository<PriceAdjustment>,
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
  ) {}

  async create(createDto: CreatePriceAdjustmentDto) {
    const model = await this.carModelRepository.findOne({
      where: { id: createDto.modelId },
      relations: ['brand'],
    });
    if (!model) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    // Check unique constraint
    const existing = await this.priceAdjustmentRepository.findOne({
      where: {
        modelId: createDto.modelId,
        category: createDto.category,
        code: createDto.code,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Adjustment dengan kombinasi model, category, dan code sudah ada',
      );
    }

    // Validate colorHex for color category
    if (
      createDto.category === AdjustmentCategory.COLOR &&
      !createDto.colorHex
    ) {
      throw new BadRequestException(
        'colorHex wajib diisi untuk category color',
      );
    }

    const adjustment = this.priceAdjustmentRepository.create({
      ...createDto,
      adjustmentType: createDto.adjustmentType || AdjustmentType.FIXED,
    });
    const saved = await this.priceAdjustmentRepository.save(adjustment);

    return {
      ...saved,
      modelName: model.modelName,
      brandName: model.brand?.name,
    };
  }

  async bulkCreate(modelId: string, bulkDto: BulkCreatePriceAdjustmentDto) {
    const model = await this.carModelRepository.findOne({
      where: { id: modelId },
      relations: ['brand'],
    });
    if (!model) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    const created: PriceAdjustment[] = [];
    const categories = { transmission: 0, ownership: 0, color: 0 };

    for (const item of bulkDto.adjustments) {
      const existing = await this.priceAdjustmentRepository.findOne({
        where: {
          modelId,
          category: item.category,
          code: item.code,
        },
      });

      if (existing) continue;

      const adjustment = this.priceAdjustmentRepository.create({
        modelId,
        category: item.category,
        code: item.code,
        name: item.name,
        colorHex: item.colorHex,
        adjustmentType: AdjustmentType.FIXED,
        adjustmentValue: item.adjustmentValue,
        sortOrder: item.sortOrder || 0,
        isBaseline: item.isBaseline || false,
        isActive: true,
      });

      const saved = await this.priceAdjustmentRepository.save(adjustment);
      created.push(saved);
      categories[item.category]++;
    }

    return {
      message: `${created.length} price adjustments created successfully`,
      modelId,
      modelName: model.modelName,
      createdCount: created.length,
      categories,
    };
  }

  async findByModelId(modelId: string) {
    const model = await this.carModelRepository.findOne({
      where: { id: modelId },
      relations: ['brand'],
    });
    if (!model) {
      throw new NotFoundException('Model mobil tidak ditemukan');
    }

    const adjustments = await this.priceAdjustmentRepository.find({
      where: { modelId, isActive: true },
      order: { category: 'ASC', sortOrder: 'ASC' },
    });

    // Group by category
    const grouped = {
      transmission: [] as any[],
      ownership: [] as any[],
      color: [] as any[],
    };

    for (const adj of adjustments) {
      const item = {
        id: adj.id,
        code: adj.code,
        name: adj.name,
        adjustmentValue: Number(adj.adjustmentValue),
        isBaseline: adj.isBaseline,
        ...(adj.category === AdjustmentCategory.COLOR && {
          colorHex: adj.colorHex,
        }),
      };
      grouped[adj.category].push(item);
    }

    return {
      modelId,
      modelName: model.modelName,
      brandName: model.brand?.name,
      adjustments: grouped,
    };
  }

  async findAll(queryDto: QueryPriceAdjustmentDto) {
    const { page = 1, perPage = 10, modelId, category, isActive } = queryDto;

    const qb = this.priceAdjustmentRepository
      .createQueryBuilder('pa')
      .leftJoinAndSelect('pa.model', 'model')
      .leftJoinAndSelect('model.brand', 'brand');

    if (modelId) {
      qb.andWhere('pa.modelId = :modelId', { modelId });
    }

    if (category) {
      qb.andWhere('pa.category = :category', { category });
    }

    if (isActive !== undefined) {
      qb.andWhere('pa.isActive = :isActive', { isActive });
    }

    qb.orderBy('pa.category', 'ASC').addOrderBy('pa.sortOrder', 'ASC');

    const skip = (page - 1) * perPage;
    qb.skip(skip).take(perPage);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((pa) => ({
        ...pa,
        modelName: pa.model?.modelName,
        brandName: pa.model?.brand?.name,
        adjustmentValue: Number(pa.adjustmentValue),
      })),
      pagination: {
        page,
        pageSize: perPage,
        totalRecords: total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string) {
    const adjustment = await this.priceAdjustmentRepository.findOne({
      where: { id },
      relations: ['model', 'model.brand'],
    });

    if (!adjustment) {
      throw new NotFoundException('Price adjustment tidak ditemukan');
    }

    return {
      ...adjustment,
      modelName: adjustment.model?.modelName,
      brandName: adjustment.model?.brand?.name,
      adjustmentValue: Number(adjustment.adjustmentValue),
    };
  }

  async update(id: string, updateDto: UpdatePriceAdjustmentDto) {
    const adjustment = await this.priceAdjustmentRepository.findOne({
      where: { id },
    });
    if (!adjustment) {
      throw new NotFoundException('Price adjustment tidak ditemukan');
    }

    Object.assign(adjustment, updateDto);
    await this.priceAdjustmentRepository.save(adjustment);

    return {
      message: 'Price adjustment berhasil diupdate',
      data: await this.findOne(id),
    };
  }

  async remove(id: string) {
    const adjustment = await this.priceAdjustmentRepository.findOne({
      where: { id },
    });
    if (!adjustment) {
      throw new NotFoundException('Price adjustment tidak ditemukan');
    }

    await this.priceAdjustmentRepository.delete(id);
    return { message: 'Price adjustment berhasil dihapus' };
  }
}
