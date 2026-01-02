import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Variant } from '../entities/variant.entity';
import { YearPrice } from '../entities/year-price.entity';
import { PriceAdjustment, AdjustmentCategory } from '../entities/price-adjustment.entity';
import { Brand } from '../entities/brand.entity';
import { CarModel } from '../entities/car-model.entity';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { QuickCalculateDto } from './dto/quick-calculate.dto';

@Injectable()
export class PriceCalculatorService {
  constructor(
    @InjectRepository(Variant)
    private variantRepository: Repository<Variant>,
    @InjectRepository(YearPrice)
    private yearPriceRepository: Repository<YearPrice>,
    @InjectRepository(PriceAdjustment)
    private priceAdjustmentRepository: Repository<PriceAdjustment>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(CarModel)
    private carModelRepository: Repository<CarModel>,
  ) {}

  async calculate(calculateDto: CalculatePriceDto) {
    // Get variant with model and brand
    const variant = await this.variantRepository.findOne({
      where: { id: calculateDto.variantId, isActive: true },
      relations: ['model', 'model.brand'],
    });
    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan atau tidak aktif');
    }

    // Get base price for year
    const yearPrice = await this.yearPriceRepository.findOne({
      where: {
        variantId: calculateDto.variantId,
        year: calculateDto.year,
        isActive: true,
      },
    });
    if (!yearPrice) {
      throw new NotFoundException(`Harga untuk tahun ${calculateDto.year} tidak ditemukan`);
    }

    const modelId = variant.modelId;
    const basePrice = Number(yearPrice.basePrice);

    // Get adjustments
    const [transmissionAdj, ownershipAdj, colorAdj] = await Promise.all([
      this.priceAdjustmentRepository.findOne({
        where: {
          modelId,
          category: AdjustmentCategory.TRANSMISSION,
          code: calculateDto.transmissionCode,
          isActive: true,
        },
      }),
      this.priceAdjustmentRepository.findOne({
        where: {
          modelId,
          category: AdjustmentCategory.OWNERSHIP,
          code: calculateDto.ownershipCode,
          isActive: true,
        },
      }),
      this.priceAdjustmentRepository.findOne({
        where: {
          modelId,
          category: AdjustmentCategory.COLOR,
          code: calculateDto.colorCode,
          isActive: true,
        },
      }),
    ]);

    if (!transmissionAdj) {
      throw new BadRequestException(`Kode transmisi '${calculateDto.transmissionCode}' tidak valid untuk model ini`);
    }
    if (!ownershipAdj) {
      throw new BadRequestException(`Kode kepemilikan '${calculateDto.ownershipCode}' tidak valid untuk model ini`);
    }
    if (!colorAdj) {
      throw new BadRequestException(`Kode warna '${calculateDto.colorCode}' tidak valid untuk model ini`);
    }

    const transmissionAmount = Number(transmissionAdj.adjustmentValue);
    const ownershipAmount = Number(ownershipAdj.adjustmentValue);
    const colorAmount = Number(colorAdj.adjustmentValue);
    const totalAdjustments = transmissionAmount + ownershipAmount + colorAmount;
    const finalPrice = basePrice + totalAdjustments;

    // Price range +/- 5%
    const minPrice = Math.round(finalPrice * 0.95);
    const maxPrice = Math.round(finalPrice * 1.05);

    return {
      calculation: {
        id: uuidv4(),
        calculatedAt: new Date().toISOString(),
      },
      car: {
        brandId: variant.model.brandId,
        brandName: variant.model.brand?.name,
        modelId: variant.modelId,
        modelName: variant.model.modelName,
        variantId: variant.id,
        variantName: variant.variantName,
        year: calculateDto.year,
      },
      conditions: {
        transmission: {
          code: transmissionAdj.code,
          name: transmissionAdj.name,
        },
        ownership: {
          code: ownershipAdj.code,
          name: ownershipAdj.name,
        },
        color: {
          code: colorAdj.code,
          name: colorAdj.name,
          colorHex: colorAdj.colorHex,
        },
      },
      priceBreakdown: {
        basePrice,
        adjustments: [
          { category: 'transmission', name: transmissionAdj.name, amount: transmissionAmount },
          { category: 'ownership', name: ownershipAdj.name, amount: ownershipAmount },
          { category: 'color', name: colorAdj.name, amount: colorAmount },
        ],
        totalAdjustments,
      },
      finalPrice,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        note: 'Harga dapat bervariasi +/-5% tergantung kondisi fisik',
      },
    };
  }

  async quickCalculate(quickDto: QuickCalculateDto) {
    const result = await this.calculate({
      variantId: quickDto.variantId,
      year: quickDto.year,
      transmissionCode: quickDto.transmission,
      ownershipCode: quickDto.ownership,
      colorCode: quickDto.color,
    });

    const carName = `${result.car.brandName} ${result.car.modelName} ${result.car.variantName} ${result.car.year}`;

    return {
      carName,
      finalPrice: result.finalPrice,
      formattedPrice: `Rp ${result.finalPrice.toLocaleString('id-ID')}`,
    };
  }

  async getOptions() {
    const brands = await this.brandRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    // Get distinct years from year_prices
    const yearsResult = await this.yearPriceRepository
      .createQueryBuilder('yp')
      .select('DISTINCT yp.year', 'year')
      .where('yp.isActive = :isActive', { isActive: true })
      .orderBy('yp.year', 'DESC')
      .getRawMany();

    const years = yearsResult.map((r) => r.year);

    return {
      brands: brands.map((b) => ({
        id: b.id,
        name: b.name,
        logo: b.logo,
      })),
      years,
    };
  }

  async getModelsByBrand(brandId: string) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });
    if (!brand) {
      throw new NotFoundException('Brand tidak ditemukan');
    }

    const models = await this.carModelRepository.find({
      where: { brandId, isActive: true },
      order: { modelName: 'ASC' },
    });

    return {
      brandId,
      brandName: brand.name,
      models: models.map((m) => ({
        id: m.id,
        modelName: m.modelName,
        imageUrl: m.imageUrl,
      })),
    };
  }

  async getYearsByVariant(variantId: string) {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
      relations: ['model', 'model.brand'],
    });
    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    const yearPrices = await this.yearPriceRepository.find({
      where: { variantId, isActive: true },
      order: { year: 'DESC' },
    });

    return {
      variantId,
      variantName: variant.variantName,
      modelName: variant.model?.modelName,
      brandName: variant.model?.brand?.name,
      years: yearPrices.map((yp) => yp.year),
    };
  }
}
