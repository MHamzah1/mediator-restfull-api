import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CarModel } from './car-model.entity';

export enum TransmissionType {
  MATIC = 'matic',
  MANUAL = 'manual',
  BOTH = 'both',
}

@Entity('variants')
export class Variant {
  @ApiProperty({ example: 'uuid', description: 'Variant ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid', description: 'Car Model ID' })
  @Column()
  modelId: string;

  @ManyToOne(() => CarModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modelId' })
  model: CarModel;

  @ApiProperty({ example: 'G', description: 'Nama variant' })
  @Column()
  variantName: string;

  @ApiProperty({ example: 'AVZ-G', description: 'Kode variant (unique)' })
  @Column({ unique: true })
  variantCode: string;

  @ApiProperty({ example: 'Tipe menengah dengan fitur lengkap' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 'both', enum: TransmissionType })
  @Column({
    type: 'enum',
    enum: TransmissionType,
    default: TransmissionType.BOTH,
  })
  transmissionType: TransmissionType;

  @ApiProperty({ example: 1 })
  @Column({ default: 0 })
  sortOrder: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
