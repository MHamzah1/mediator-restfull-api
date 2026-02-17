import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Showroom } from './showroom.entity';
import { WarehouseVehicle } from './warehouse-vehicle.entity';
import { User } from './user.entity';

export enum StockAction { VEHICLE_IN = 'vehicle_in', VEHICLE_OUT = 'vehicle_out', STATUS_CHANGE = 'status_change', ZONE_TRANSFER = 'zone_transfer' }

@Entity('stock_logs')
export class StockLog {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() showroomId: string;
  @ManyToOne(() => Showroom) @JoinColumn({ name: 'showroomId' }) showroom: Showroom;

  @Column() warehouseVehicleId: string;
  @ManyToOne(() => WarehouseVehicle) @JoinColumn({ name: 'warehouseVehicleId' }) warehouseVehicle: WarehouseVehicle;

  @Column({ type: 'varchar' }) action: StockAction;
  @Column({ length: 50, nullable: true }) previousStatus: string;
  @Column({ length: 50, nullable: true }) newStatus: string;

  @Column() performedById: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'performedById' }) performedBy: User;

  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
}
