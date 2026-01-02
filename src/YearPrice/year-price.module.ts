import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YearPrice } from '../entities/year-price.entity';
import { Variant } from '../entities/variant.entity';
import { YearPriceService } from './year-price.service';
import { YearPriceController } from './year-price.controller';

@Module({
  imports: [TypeOrmModule.forFeature([YearPrice, Variant])],
  providers: [YearPriceService],
  controllers: [YearPriceController],
  exports: [YearPriceService],
})
export class YearPriceModule {}
