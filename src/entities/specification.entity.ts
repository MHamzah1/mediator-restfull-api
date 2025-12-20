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

export enum SpecCategory {
  ENGINE = 'engine',
  TRANSMISSION = 'transmission',
  FUEL = 'fuel',
  DIMENSION = 'dimension',
  SAFETY = 'safety',
}

@Entity('specifications')
export class Specification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'model_id' })
  modelId: string;

  @ManyToOne(() => CarModel, (carModel) => carModel.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'model_id' })
  carModel: CarModel;

  @Column({ name: 'spec_name', length: 100 })
  specName: string;

  @Column({
    type: 'enum',
    enum: SpecCategory,
    name: 'spec_category',
  })
  specCategory: SpecCategory;

  @Column({ name: 'spec_value', length: 255 })
  specValue: string;

  @Column({ name: 'spec_unit', length: 50, nullable: true })
  specUnit: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
