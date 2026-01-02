import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculationHistory } from '../entities/calculation-history.entity';
import { Variant } from '../entities/variant.entity';
import { YearPrice } from '../entities/year-price.entity';
import { CreateCalculationHistoryDto } from './dto/create-calculation-history.dto';

@Injectable()
export class CalculationHistoryService {
  constructor(
    @InjectRepository(CalculationHistory)
    private calculationHistoryRepository: Repository<CalculationHistory>,
    @InjectRepository(Variant)
    private variantRepository: Repository<Variant>,
    @InjectRepository(YearPrice)
    private yearPriceRepository: Repository<YearPrice>,
  ) {}

  async create(userId: string, createDto: CreateCalculationHistoryDto) {
    // Validate variant
    const variant = await this.variantRepository.findOne({
      where: { id: createDto.variantId },
    });
    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    // Get base price
    const yearPrice = await this.yearPriceRepository.findOne({
      where: { variantId: createDto.variantId, year: createDto.year },
    });

    const basePrice = yearPrice ? Number(yearPrice.basePrice) : 0;
    const totalAdjustments = createDto.finalPrice - basePrice;

    const history = this.calculationHistoryRepository.create({
      userId,
      variantId: createDto.variantId,
      year: createDto.year,
      transmissionCode: createDto.transmissionCode,
      ownershipCode: createDto.ownershipCode,
      colorCode: createDto.colorCode,
      basePrice,
      totalAdjustments,
      finalPrice: createDto.finalPrice,
      notes: createDto.notes,
    });

    const saved = await this.calculationHistoryRepository.save(history);

    return {
      message: 'Kalkulasi berhasil disimpan',
      data: saved,
    };
  }

  async findMyCalculations(userId: string) {
    const calculations = await this.calculationHistoryRepository.find({
      where: { userId },
      relations: ['variant', 'variant.model', 'variant.model.brand'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: calculations.map((c) => ({
        id: c.id,
        car: {
          brandName: c.variant?.model?.brand?.name,
          modelName: c.variant?.model?.modelName,
          variantName: c.variant?.variantName,
          year: c.year,
        },
        conditions: {
          transmissionCode: c.transmissionCode,
          ownershipCode: c.ownershipCode,
          colorCode: c.colorCode,
        },
        basePrice: Number(c.basePrice),
        totalAdjustments: Number(c.totalAdjustments),
        finalPrice: Number(c.finalPrice),
        notes: c.notes,
        createdAt: c.createdAt,
      })),
    };
  }

  async remove(userId: string, id: string) {
    const calculation = await this.calculationHistoryRepository.findOne({
      where: { id, userId },
    });

    if (!calculation) {
      throw new NotFoundException('Kalkulasi tidak ditemukan');
    }

    await this.calculationHistoryRepository.delete(id);
    return { message: 'Kalkulasi berhasil dihapus' };
  }
}
