import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Showroom } from './showroom.entity';

export enum ZoneType {
  READY = 'ready', LIGHT_REPAIR = 'light_repair', HEAVY_REPAIR = 'heavy_repair',
  HOLDING = 'holding', SHOWROOM_DISPLAY = 'showroom_display',
}

@Entity('warehouse_zones')
export class WarehouseZone {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() showroomId: string;

  @ManyToOne(() => Showroom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'showroomId' })
  showroom: Showroom;

  @Column({ length: 20 }) code: string;
  @Column({ length: 100 }) name: string;

  @Column({ type: 'varchar' }) type: ZoneType;
  @Column({ default: 50 }) capacity: number;
  @Column({ default: 0 }) currentCount: number;
  @Column({ default: true }) isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
