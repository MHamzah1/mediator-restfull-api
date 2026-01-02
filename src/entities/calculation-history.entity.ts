import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Variant } from './variant.entity';

@Entity('calculation_histories')
export class CalculationHistory {
  @ApiProperty({ example: 'uuid', description: 'Calculation History ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ example: 'uuid', description: 'Variant ID' })
  @Column()
  variantId: string;

  @ManyToOne(() => Variant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variantId' })
  variant: Variant;

  @ApiProperty({ example: 2018 })
  @Column()
  year: number;

  @ApiProperty({ example: 'matic' })
  @Column()
  transmissionCode: string;

  @ApiProperty({ example: 'personal' })
  @Column()
  ownershipCode: string;

  @ApiProperty({ example: 'hitam' })
  @Column()
  colorCode: string;

  @ApiProperty({ example: 135000000 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basePrice: number;

  @ApiProperty({ example: -5000000 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAdjustments: number;

  @ApiProperty({ example: 130000000 })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  finalPrice: number;

  @ApiProperty({ example: 'Untuk referensi' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
