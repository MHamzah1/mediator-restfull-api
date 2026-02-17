import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { WarehouseVehicle } from './warehouse-vehicle.entity';
import { WarehouseZone } from './warehouse-zone.entity';
import { User } from './user.entity';

export enum PlacementAction { PLACED = 'placed', MOVED = 'moved', REMOVED = 'removed' }

@Entity('vehicle_placements')
export class VehiclePlacement {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() warehouseVehicleId: string;
  @ManyToOne(() => WarehouseVehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseVehicleId' })
  warehouseVehicle: WarehouseVehicle;

  @Column() zoneId: string;
  @ManyToOne(() => WarehouseZone) @JoinColumn({ name: 'zoneId' }) zone: WarehouseZone;

  @Column() scannedById: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'scannedById' }) scannedBy: User;

  @Column({ type: 'varchar', default: PlacementAction.PLACED }) action: PlacementAction;
  @Column({ default: true }) isCurrent: boolean;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) placedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) removedAt: Date;
  @CreateDateColumn() createdAt: Date;
}
