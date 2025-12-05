import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModel } from '../entities/car-model.entity';
import { Brand } from '../entities/brand.entity';
import { CarModelService } from './car-model.service';
import { CarModelController } from './car-model.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CarModel, Brand])],
  providers: [CarModelService],
  controllers: [CarModelController],
  exports: [CarModelService],
})
export class CarModelModule {}
