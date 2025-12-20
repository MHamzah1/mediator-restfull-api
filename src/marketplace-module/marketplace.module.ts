import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModel } from '../entities/car-model.entity';
import { User } from '../entities/user.entity';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { Listing } from 'src/entities/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, CarModel, User])],
  providers: [MarketplaceService],
  controllers: [MarketplaceController],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
