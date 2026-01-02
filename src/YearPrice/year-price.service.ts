import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YearPrice } from '../entities/year-price.entity';
import { Variant } from '../entities/variant.entity';
import {
  CreateYearPriceDto,
  BulkCreateYearPriceDto,
} from './dto/create-year-price.dto';
import { UpdateYearPriceDto } from './dto/update-year-price.dto';
import {
  QueryYearPriceDto,
  QueryYearPriceByVariantDto,
} from './dto/query-year-price.dto';

@Injectable()
export class YearPriceService {
  constructor(
    @InjectRepository(YearPrice)
    private yearPriceRepository: Repository<YearPrice>,
    @InjectRepository(Variant)
    private variantRepository: Repository<Variant>,
  ) {}

  async create(createDto: CreateYearPriceDto) {
    const variant = await this.variantRepository.findOne({
      where: { id: createDto.variantId },
    });
    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    // Check unique constraint
    const existing = await this.yearPriceRepository.findOne({
      where: { variantId: createDto.variantId, year: createDto.year },
    });
    if (existing) {
      throw new ConflictException('Year price untuk tahun ini sudah ada');
    }

    const yearPrice = this.yearPriceRepository.create(createDto);
    const saved = await this.yearPriceRepository.save(yearPrice);

    return {
      message: 'Year price berhasil dibuat',
      data: saved,
    };
  }

  async bulkCreate(bulkDto: BulkCreateYearPriceDto) {
    const variant = await this.variantRepository.findOne({
      where: { id: bulkDto.variantId },
      relations: ['model', 'model.brand'],
    });
    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    const created: YearPrice[] = [];
    const errors: string[] = [];

    for (const item of bulkDto.prices) {
      const existing = await this.yearPriceRepository.findOne({
        where: { variantId: bulkDto.variantId, year: item.year },
      });

      if (existing) {
        errors.push(`Year ${item.year} sudah ada`);
        continue;
      }

      const yearPrice = this.yearPriceRepository.create({
        variantId: bulkDto.variantId,
        year: item.year,
        basePrice: item.basePrice,
        isActive: true,
      });
      const saved = await this.yearPriceRepository.save(yearPrice);
      created.push(saved);
    }

    return {
      message: `${created.length} year prices berhasil dibuat`,
      variantId: bulkDto.variantId,
      variantName: variant.variantName,
      modelName: variant.model?.modelName,
      brandName: variant.model?.brand?.name,
      createdCount: created.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async findAll(queryDto: QueryYearPriceDto) {
    const {
      page = 1,
      perPage = 10,
      variantId,
      modelId,
      brandId,
      year,
      isActive,
    } = queryDto;

    const qb = this.yearPriceRepository.createQueryBuilder('yp')
      .leftJoinAndSelect('yp.variant', 'variant')
      .leftJoinAndSelect('variant.model', 'model')
      .leftJoinAndSelect('model.brand', 'brand');

    if (variantId) {
      qb.andWhere('yp.variantId = :variantId', { variantId });
    }

    if (modelId) {
      qb.andWhere('variant.modelId = :modelId', { modelId });
    }

    if (brandId) {
      qb.andWhere('model.brandId = :brandId', { brandId });
    }

    if (year) {
      qb.andWhere('yp.year = :year', { year });
    }

    if (isActive !== undefined) {
      qb.andWhere('yp.isActive = :isActive', { isActive });
    }

    qb.orderBy('yp.year', 'DESC');

    const skip = (page - 1) * perPage;
    qb.skip(skip).take(perPage);

    const [data, total] = await qb.getManyAndCount();

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

  async findByVariantId(variantId: string, queryDto: QueryYearPriceByVariantDto) {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
      relations: ['model', 'model.brand'],
    });
    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    const qb = this.yearPriceRepository.createQueryBuilder('yp')
      .where('yp.variantId = :variantId', { variantId })
      .andWhere('yp.isActive = :isActive', { isActive: true });

    if (queryDto.yearFrom) {
      qb.andWhere('yp.year >= :yearFrom', { yearFrom: queryDto.yearFrom });
    }

    if (queryDto.yearTo) {
      qb.andWhere('yp.year <= :yearTo', { yearTo: queryDto.yearTo });
    }

    qb.orderBy('yp.year', 'DESC');

    const prices = await qb.getMany();

    return {
      variantId: variant.id,
      variantName: variant.variantName,
      modelName: variant.model?.modelName,
      brandName: variant.model?.brand?.name,
      prices: prices.map((p) => ({
        id: p.id,
        year: p.year,
        basePrice: Number(p.basePrice),
        isActive: p.isActive,
      })),
    };
  }

  async findOne(id: string) {
    const yearPrice = await this.yearPriceRepository.findOne({
      where: { id },
      relations: ['variant', 'variant.model', 'variant.model.brand'],
    });

    if (!yearPrice) {
      throw new NotFoundException('Year price tidak ditemukan');
    }

    return yearPrice;
  }

  async update(id: string, updateDto: UpdateYearPriceDto) {
    const yearPrice = await this.yearPriceRepository.findOne({ where: { id } });
    if (!yearPrice) {
      throw new NotFoundException('Year price tidak ditemukan');
    }

    Object.assign(yearPrice, updateDto);
    const updated = await this.yearPriceRepository.save(yearPrice);

    return {
      message: 'Year price berhasil diupdate',
      data: updated,
    };
  }

  async remove(id: string) {
    const yearPrice = await this.yearPriceRepository.findOne({ where: { id } });
    if (!yearPrice) {
      throw new NotFoundException('Year price tidak ditemukan');
    }

    await this.yearPriceRepository.delete(id);
    return { message: 'Year price berhasil dihapus' };
  }
}
