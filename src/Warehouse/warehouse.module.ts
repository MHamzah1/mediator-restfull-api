import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Showroom } from '../entities/showroom.entity';
import { WarehouseVehicle } from '../entities/warehouse-vehicle.entity';
import { VehicleInspection } from '../entities/vehicle-inspection.entity';
import { WarehouseZone } from '../entities/warehouse-zone.entity';
import { VehiclePlacement } from '../entities/vehicle-placement.entity';
import { RepairOrder } from '../entities/repair-order.entity';
import { AdminPayment } from '../entities/admin-payment.entity';
import { PurchaseTransaction } from '../entities/purchase-transaction.entity';
import { StockLog } from '../entities/stock-log.entity';
import { Listing } from '../entities/listing.entity';

// Service
import { WarehouseService } from './warehouse.service';

// Controllers
import {
  ShowroomController,
  VehicleController,
  InspectionController,
  ZoneController,
  RepairController,
  AdminPaymentController,
  PurchaseController,
  StockLogController,
} from './warehouse.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Showroom,
      WarehouseVehicle,
      VehicleInspection,
      WarehouseZone,
      VehiclePlacement,
      RepairOrder,
      AdminPayment,
      PurchaseTransaction,
      StockLog,
      Listing,
    ]),
  ],
  controllers: [
    ShowroomController,
    VehicleController,
    InspectionController,
    ZoneController,
    RepairController,
    AdminPaymentController,
    PurchaseController,
    StockLogController,
  ],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
