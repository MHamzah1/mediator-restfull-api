import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationHistory } from '../entities/calculation-history.entity';
import { Variant } from '../entities/variant.entity';
import { YearPrice } from '../entities/year-price.entity';
import { CalculationHistoryService } from './calculation-history.service';
import { CalculationHistoryController } from './calculation-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CalculationHistory, Variant, YearPrice])],
  providers: [CalculationHistoryService],
  controllers: [CalculationHistoryController],
  exports: [CalculationHistoryService],
})
export class CalculationHistoryModule {}
