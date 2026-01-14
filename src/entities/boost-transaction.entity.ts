import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Listing } from './listing.entity';
import { User } from './user.entity';
import { BoostPackage } from './boost-package.entity';

export enum BoostStatus {
  PENDING_PAYMENT = 'pending_payment',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  EWALLET = 'ewallet',
  CREDIT_CARD = 'credit_card',
  QRIS = 'qris',
  MANUAL = 'manual',
}

@Entity('boost_transactions')
export class BoostTransaction {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Transaction ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Listing ID',
  })
  @Column()
  listingId: string;

  @ManyToOne(() => Listing, { eager: true })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Package ID (null jika custom)',
  })
  @Column({ nullable: true })
  packageId: string;

  @ManyToOne(() => BoostPackage, { eager: true, nullable: true })
  @JoinColumn({ name: 'packageId' })
  package: BoostPackage;

  @ApiProperty({
    example: 34000,
    description: 'Total amount dalam IDR',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({
    example: 'IDR',
    description: 'Currency',
  })
  @Column({ default: 'IDR' })
  currency: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Custom duration days (jika tidak pakai package)',
  })
  @Column({ nullable: true })
  customDurationDays: number;

  @ApiPropertyOptional({
    example: 'ewallet',
    description: 'Payment method',
    enum: PaymentMethod,
  })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: 'pending',
    description: 'Payment status',
    enum: PaymentStatus,
  })
  @Column({
    type: 'varchar',
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({
    example: 'PAY-123456',
    description: 'External payment reference ID',
  })
  @Column({ nullable: true })
  paymentReference: string;

  @ApiPropertyOptional({
    example: 'https://payment-gateway.com/pay/xxx',
    description: 'Payment gateway URL',
  })
  @Column({ nullable: true })
  paymentUrl: string;

  @ApiPropertyOptional({
    example: '2026-01-14T00:00:00Z',
    description: 'Boost start date',
  })
  @Column({ nullable: true })
  startDate: Date;

  @ApiPropertyOptional({
    example: '2026-01-17T00:00:00Z',
    description: 'Boost end date',
  })
  @Column({ nullable: true })
  endDate: Date;

  @ApiProperty({
    example: 20,
    description: 'Priority score for sorting',
  })
  @Column({ default: 0 })
  priorityScore: number;

  @ApiProperty({
    example: 12289,
    description: 'Estimated minimum reach',
  })
  @Column({ default: 0 })
  estimatedReachMin: number;

  @ApiProperty({
    example: 35514,
    description: 'Estimated maximum reach',
  })
  @Column({ default: 0 })
  estimatedReachMax: number;

  @ApiProperty({
    example: 8500,
    description: 'Actual reach/impressions achieved',
  })
  @Column({ default: 0 })
  actualReach: number;

  @ApiProperty({
    example: 'pending_payment',
    description: 'Boost status',
    enum: BoostStatus,
  })
  @Column({
    type: 'varchar',
    default: BoostStatus.PENDING_PAYMENT,
  })
  status: BoostStatus;

  @ApiProperty({
    example: '2026-01-14T10:30:00Z',
    description: 'Created at',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-14T10:30:00Z',
    description: 'Updated at',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional({
    example: '2026-01-14T10:35:00Z',
    description: 'Payment confirmed at',
  })
  @Column({ nullable: true })
  paidAt: Date;

  @ApiPropertyOptional({
    example: '2026-01-17T00:00:00Z',
    description: 'Boost expired at',
  })
  @Column({ nullable: true })
  expiredAt: Date;

  @ApiPropertyOptional({
    example: '2026-01-14T11:30:00Z',
    description: 'Payment expiry time',
  })
  @Column({ nullable: true })
  paymentExpiresAt: Date;
}
