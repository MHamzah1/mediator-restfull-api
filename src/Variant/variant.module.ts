import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Variant } from '../entities/variant.entity';
import { CarModel } from '../entities/car-model.entity';
import { VariantService } from './variant.service';
import { VariantController } from './variant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Variant, CarModel])],
  providers: [VariantService],
  controllers: [VariantController],
  exports: [VariantService],
})
export class VariantModule {}
