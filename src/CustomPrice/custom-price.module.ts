import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomPrice } from '../entities/custom-price.entity';
import { CarModel } from '../entities/car-model.entity';
import { CustomPriceService } from './custom-price.service';
import { CustomPriceController } from './custom-price.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomPrice, CarModel])],
  providers: [CustomPriceService],
  controllers: [CustomPriceController],
  exports: [CustomPriceService],
})
export class CustomPriceModule {}
