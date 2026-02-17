import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { Showroom } from './showroom.entity';
import { CarModel } from './car-model.entity';

export enum VehicleStatus {
  INSPECTING = 'inspecting',
  REGISTERED = 'registered',
  PENDING_PAYMENT = 'pending_payment',
  IN_WAREHOUSE = 'in_warehouse',
  IN_REPAIR = 'in_repair',
  READY = 'ready',
  LISTED = 'listed',
  SOLD = 'sold',
  REJECTED = 'rejected',
}

@Entity('warehouse_vehicles')
export class WarehouseVehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  showroomId: string;

  @ManyToOne(() => Showroom, { eager: true })
  @JoinColumn({ name: 'showroomId' })
  showroom: Showroom;

  @Column()
  sellerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column({ nullable: true })
  carModelId: string;

  @ManyToOne(() => CarModel, { nullable: true, eager: true })
  @JoinColumn({ name: 'carModelId' })
  carModel: CarModel;

  @ApiProperty({ example: 'SRM-JKT01-2026-00001' })
  @Column({ length: 50, unique: true })
  barcode: string;

  @Column({ length: 100 })
  brandName: string;

  @Column({ length: 100 })
  modelName: string;

  @Column()
  year: number;

  @Column({ length: 50 })
  color: string;

  @Column({ length: 20 })
  licensePlate: string;

  @Column({ length: 50, unique: true })
  chassisNumber: string;

  @Column({ length: 50 })
  engineNumber: string;

  @Column()
  mileage: number;

  @Column({ length: 20 })
  transmission: string;

  @Column({ length: 20 })
  fuelType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  askingPrice: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ length: 200 })
  sellerName: string;

  @Column({ length: 20 })
  sellerPhone: string;

  @Column({ length: 20, nullable: true })
  sellerKtp: string;

  @ApiProperty({ enum: VehicleStatus })
  @Column({ type: 'varchar', default: VehicleStatus.INSPECTING })
  status: VehicleStatus;

  @Column({ nullable: true })
  listingId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
