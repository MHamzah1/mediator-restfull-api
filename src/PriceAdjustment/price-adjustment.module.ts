import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceAdjustment } from '../entities/price-adjustment.entity';
import { CarModel } from '../entities/car-model.entity';
import { PriceAdjustmentService } from './price-adjustment.service';
import { PriceAdjustmentController } from './price-adjustment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PriceAdjustment, CarModel])],
  providers: [PriceAdjustmentService],
  controllers: [PriceAdjustmentController],
  exports: [PriceAdjustmentService],
})
export class PriceAdjustmentModule {}
