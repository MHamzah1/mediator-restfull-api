import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CarModel } from './car-model.entity';

export enum PriceType {
  ADDITION = 'addition',
  DEDUCTION = 'deduction',
  PERCENTAGE = 'percentage',
}

@Entity('custom_prices')
export class CustomPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'model_id' })
  modelId: string;

  @ManyToOne(() => CarModel, (carModel) => carModel.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'model_id' })
  carModel: CarModel;

  @Column({ name: 'price_name', length: 100 })
  priceName: string;

  @Column({
    type: 'enum',
    enum: PriceType,
    name: 'price_type',
  })
  priceType: PriceType;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'price_value' })
  priceValue: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
