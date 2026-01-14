import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostPackage } from '../entities/boost-package.entity';
import { BoostTransaction } from '../entities/boost-transaction.entity';
import { BoostStatistic } from '../entities/boost-statistic.entity';
import { Listing } from '../entities/listing.entity';
import { BoostPackageService } from './boost-package.service';
import { BoostTransactionService } from './boost-transaction.service';
import { BoostPackageController } from './boost-package.controller';
import { BoostTransactionController } from './boost-transaction.controller';
import { BoostWebhookController } from './boost-webhook.controller';
import { BoostAdminController } from './boost-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoostPackage,
      BoostTransaction,
      BoostStatistic,
      Listing,
    ]),
  ],
  controllers: [
    BoostPackageController,
    BoostTransactionController,
    BoostWebhookController,
    BoostAdminController,
  ],
  providers: [
    BoostPackageService,
    BoostTransactionService,
  ],
  exports: [
    BoostPackageService,
    BoostTransactionService,
  ],
})
export class BoostModule implements OnModuleInit {
  constructor(private readonly boostPackageService: BoostPackageService) {}

  async onModuleInit() {
    // Seed default packages on module initialization
    try {
      await this.boostPackageService.seedDefaultPackages();
      console.log('✅ Default boost packages seeded');
    } catch (error) {
      console.log('ℹ️ Boost packages already exist or error:', error.message);
    }
  }
}
