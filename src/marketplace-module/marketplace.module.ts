import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModel } from '../entities/car-model.entity';
import { User } from '../entities/user.entity';
import { Variant } from '../entities/variant.entity';
import { YearPrice } from '../entities/year-price.entity';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { Listing } from 'src/entities/listing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, CarModel, User, Variant, YearPrice]),
  ],
  providers: [MarketplaceService],
  controllers: [MarketplaceController],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
