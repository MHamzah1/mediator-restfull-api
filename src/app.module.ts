import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from './config/db.config';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BrandModule } from './Brand/brand.module';
import { CarModelModule } from './CarModel/car-model.module';
import { SpecificationModule } from './Specification/specification.module';
import { CustomPriceModule } from './CustomPrice/custom-price.module';
import { MarketplaceModule } from './marketplace-module/marketplace.module';

// New modules for API V2.1
import { VariantModule } from './Variant/variant.module';
import { YearPriceModule } from './YearPrice/year-price.module';
import { PriceAdjustmentModule } from './PriceAdjustment/price-adjustment.module';
import { PriceCalculatorModule } from './PriceCalculator/price-calculator.module';
import { CalculationHistoryModule } from './CalculationHistory/calculation-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    UsersModule,
    AuthModule,
    BrandModule,
    CarModelModule,
    SpecificationModule,
    CustomPriceModule,
    MarketplaceModule,
    // API V2.1 Modules
    VariantModule,
    YearPriceModule,
    PriceAdjustmentModule,
    PriceCalculatorModule,
    CalculationHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
