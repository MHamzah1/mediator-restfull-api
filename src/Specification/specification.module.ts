import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specification } from '../entities/specification.entity';
import { CarModel } from '../entities/car-model.entity';
import { SpecificationService } from './specification.service';
import { SpecificationController } from './specification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Specification, CarModel])],
  providers: [SpecificationService],
  controllers: [SpecificationController],
  exports: [SpecificationService],
})
export class SpecificationModule {}
