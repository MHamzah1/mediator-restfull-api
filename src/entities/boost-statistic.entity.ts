import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BoostTransaction } from './boost-transaction.entity';

@Entity('boost_statistics')
export class BoostStatistic {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Statistic ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Boost Transaction ID',
  })
  @Column()
  boostTransactionId: string;

  @ManyToOne(() => BoostTransaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boostTransactionId' })
  boostTransaction: BoostTransaction;

  @ApiProperty({
    example: '2026-01-14',
    description: 'Statistics date',
  })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({
    example: 4200,
    description: 'Number of impressions',
  })
  @Column({ default: 0 })
  impressions: number;

  @ApiProperty({
    example: 180,
    description: 'Number of clicks',
  })
  @Column({ default: 0 })
  clicks: number;

  @ApiProperty({
    example: 15,
    description: 'Number of contact/WhatsApp clicks',
  })
  @Column({ default: 0 })
  contactClicks: number;

  @ApiProperty({
    example: '2026-01-14T10:30:00Z',
    description: 'Created at',
  })
  @CreateDateColumn()
  createdAt: Date;
}
