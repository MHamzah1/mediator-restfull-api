import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarehouseVehicle } from './warehouse-vehicle.entity';
import { User } from './user.entity';

export enum RepairType { LIGHT = 'light', HEAVY = 'heavy' }
export enum RepairStatus { PENDING = 'pending', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', CANCELLED = 'cancelled' }

@Entity('repair_orders')
export class RepairOrder {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() warehouseVehicleId: string;
  @ManyToOne(() => WarehouseVehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseVehicleId' }) warehouseVehicle: WarehouseVehicle;

  @Column({ nullable: true }) assignedToId: string;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'assignedToId' }) assignedTo: User;

  @Column({ type: 'varchar' }) repairType: RepairType;
  @Column({ type: 'text' }) description: string;
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true }) estimatedCost: number;
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true }) actualCost: number;
  @Column({ type: 'varchar', default: RepairStatus.PENDING }) status: RepairStatus;
  @Column({ type: 'timestamp', nullable: true }) startedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) completedAt: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
