import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarehouseVehicle } from './warehouse-vehicle.entity';
import { User } from './user.entity';
import { PaymentMethod, PaymentStatus } from './boost-transaction.entity';

@Entity('admin_payments')
export class AdminPayment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() warehouseVehicleId: string;
  @ManyToOne(() => WarehouseVehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseVehicleId' }) warehouseVehicle: WarehouseVehicle;

  @Column() payerId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'payerId' }) payer: User;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 2000000 }) amount: number;
  @Column({ default: 'IDR' }) currency: string;
  @Column({ type: 'varchar', nullable: true }) paymentMethod: PaymentMethod;
  @Column({ type: 'varchar', default: PaymentStatus.PENDING }) paymentStatus: PaymentStatus;
  @Column({ nullable: true }) paymentReference: string;
  @Column({ nullable: true }) paymentUrl: string;
  @Column({ length: 50, unique: true }) invoiceNumber: string;
  @Column({ type: 'timestamp', nullable: true }) paidAt: Date;
  @Column({ type: 'timestamp', nullable: true }) expiresAt: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
