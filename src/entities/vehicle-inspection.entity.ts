import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { WarehouseVehicle } from './warehouse-vehicle.entity';

export enum InspectionType { INITIAL = 'initial', RE_INSPECTION = 're_inspection', QC = 'qc' }
export enum InspectionResult { ACCEPTED_READY = 'accepted_ready', ACCEPTED_REPAIR = 'accepted_repair', REJECTED = 'rejected' }
export enum DocumentStatus { COMPLETE = 'complete', INCOMPLETE = 'incomplete', INVALID = 'invalid' }

@Entity('vehicle_inspections')
export class VehicleInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  warehouseVehicleId: string;

  @ManyToOne(() => WarehouseVehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseVehicleId' })
  warehouseVehicle: WarehouseVehicle;

  @Column()
  inspectorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'inspectorId' })
  inspector: User;

  @Column({ type: 'varchar', default: InspectionType.INITIAL })
  inspectionType: InspectionType;

  @Column({ type: 'varchar' })
  overallResult: InspectionResult;

  @Column({ nullable: true }) exteriorScore: number;
  @Column({ nullable: true }) interiorScore: number;
  @Column({ nullable: true }) engineScore: number;
  @Column({ nullable: true }) electricalScore: number;
  @Column({ nullable: true }) chassisScore: number;

  @Column({ type: 'varchar', default: DocumentStatus.COMPLETE })
  documentStatus: DocumentStatus;

  @Column({ default: false }) hasBpkb: boolean;
  @Column({ default: false }) hasStnk: boolean;
  @Column({ default: false }) hasFaktur: boolean;
  @Column({ default: false }) hasKtp: boolean;
  @Column({ default: false }) hasSpareKey: boolean;
  @Column({ default: true }) chassisNumberMatch: boolean;

  @Column({ type: 'text', nullable: true }) repairNotes: string;
  @Column({ type: 'text', nullable: true }) rejectionReason: string;
  @Column('simple-array', { nullable: true }) photos: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  inspectedAt: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
