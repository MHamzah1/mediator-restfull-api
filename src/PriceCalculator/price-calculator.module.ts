import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Variant } from '../entities/variant.entity';
import { YearPrice } from '../entities/year-price.entity';
import { PriceAdjustment } from '../entities/price-adjustment.entity';
import { Brand } from '../entities/brand.entity';
import { CarModel } from '../entities/car-model.entity';
import { PriceCalculatorService } from './price-calculator.service';
import { PriceCalculatorController } from './price-calculator.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Variant,
      YearPrice,
      PriceAdjustment,
      Brand,
      CarModel,
    ]),
  ],
  providers: [PriceCalculatorService],
  controllers: [PriceCalculatorController],
  exports: [PriceCalculatorService],
})
export class PriceCalculatorModule {}
