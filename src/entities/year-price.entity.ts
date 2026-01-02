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
import { Variant } from './variant.entity';

@Entity('year_prices')
@Unique(['variantId', 'year'])
export class YearPrice {
  @ApiProperty({ example: 'uuid', description: 'Year Price ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'uuid', description: 'Variant ID' })
  @Column()
  variantId: string;

  @ManyToOne(() => Variant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variantId' })
  variant: Variant;

  @ApiProperty({ example: 2024, description: 'Tahun' })
  @Column()
  year: number;

  @ApiProperty({ example: 230000000, description: 'Harga dasar' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basePrice: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
