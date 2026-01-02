import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CarModel } from './car-model.entity';

export enum AdjustmentCategory {
  TRANSMISSION = 'transmission',
  OWNERSHIP = 'ownership',
  COLOR = 'color',
}

export enum AdjustmentType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

@Entity('price_adjustments')
@Unique(['modelId', 'category', 'code'])
export class PriceAdjustment {
  @ApiProperty({ example: 'uuid', description: 'Price Adjustment ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid', description: 'Car Model ID (FK)' })
  @Column()
  modelId: string;

  @ManyToOne(() => CarModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelId' })
  model: CarModel;

  @ApiProperty({ example: 'transmission', enum: AdjustmentCategory })
  @Column({
    type: 'enum',
    enum: AdjustmentCategory,
  })
  category: AdjustmentCategory;

  @ApiProperty({ example: 'manual', description: 'Kode adjustment' })
  @Column()
  code: string;

  @ApiProperty({ example: 'Transmisi Manual', description: 'Nama adjustment' })
  @Column()
  name: string;

  @ApiProperty({ example: '#ffffff', description: 'Hex color (untuk category color)', nullable: true })
  @Column({ nullable: true })
  colorHex: string;

  @ApiProperty({ example: 'fixed', enum: AdjustmentType })
  @Column({
    type: 'enum',
    enum: AdjustmentType,
    default: AdjustmentType.FIXED,
  })
  adjustmentType: AdjustmentType;

  @ApiProperty({ example: -5000000, description: 'Nilai adjustment' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  adjustmentValue: number;

  @ApiProperty({ example: 'Pengurangan harga untuk transmisi manual' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 1 })
  @Column({ default: 0 })
  sortOrder: number;

  @ApiProperty({ example: false, description: 'Apakah ini baseline (nilai 0)' })
  @Column({ default: false })
  isBaseline: boolean;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
