import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { WarehouseVehicle } from './warehouse-vehicle.entity';
import { Listing } from './listing.entity';
import { User } from './user.entity';
import { PaymentMethod } from './boost-transaction.entity';

export enum PurchasePaymentType { CASH = 'cash', CREDIT = 'credit', BOOKING_FEE = 'booking_fee' }
export enum PurchasePaymentStatus { PENDING = 'pending', DP_PAID = 'dp_paid', FULLY_PAID = 'fully_paid', FAILED = 'failed', REFUNDED = 'refunded' }
export enum PurchaseStatus { PENDING = 'pending', CONFIRMED = 'confirmed', COMPLETED = 'completed', CANCELLED = 'cancelled' }

@Entity('purchase_transactions')
export class PurchaseTransaction {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() warehouseVehicleId: string;
  @ManyToOne(() => WarehouseVehicle) @JoinColumn({ name: 'warehouseVehicleId' }) warehouseVehicle: WarehouseVehicle;

  @Column({ nullable: true }) listingId: string;
  @ManyToOne(() => Listing, { nullable: true }) @JoinColumn({ name: 'listingId' }) listing: Listing;

  @Column() buyerId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'buyerId' }) buyer: User;

  @Column({ type: 'decimal', precision: 15, scale: 2 }) totalPrice: number;
  @Column({ type: 'varchar' }) paymentType: PurchasePaymentType;
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true }) downPayment: number;
  @Column({ type: 'varchar', nullable: true }) paymentMethod: PaymentMethod;
  @Column({ type: 'varchar', default: PurchasePaymentStatus.PENDING }) paymentStatus: PurchasePaymentStatus;
  @Column({ nullable: true }) paymentReference: string;
  @Column({ nullable: true }) paymentUrl: string;
  @Column({ length: 50, unique: true }) invoiceNumber: string;
  @Column({ type: 'varchar', default: PurchaseStatus.PENDING }) status: PurchaseStatus;
  @Column({ length: 200 }) buyerName: string;
  @Column({ length: 20 }) buyerPhone: string;
  @Column({ length: 20, nullable: true }) buyerKtp: string;
  @Column({ type: 'timestamp', nullable: true }) paidAt: Date;
  @Column({ type: 'timestamp', nullable: true }) completedAt: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
