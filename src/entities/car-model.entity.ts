import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Brand } from './brand.entity';

@Entity('car_models')
export class CarModel {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Car Model ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Brand ID',
  })
  @Column()
  brandId: string;

  @ApiProperty({
    description: 'Brand relation',
  })
  @ManyToOne(() => Brand, { eager: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @ApiProperty({
    example: 'Fortuner',
    description: 'Nama model mobil',
  })
  @Column()
  modelName: string;

  @ApiProperty({
    example: 'SUV premium dari Toyota',
    description: 'Deskripsi model mobil',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 500000000,
    description: 'Harga dasar model',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basePrice: number;

  @ApiProperty({
    example: 'https://cdn.example.com/cars/fortuner.jpg',
    description: 'URL gambar model mobil',
  })
  @Column({ nullable: true })
  imageUrl: string;

  @ApiProperty({
    example: true,
    description: 'Status aktif model',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2025-01-10T08:00:00Z',
    description: 'Tanggal dibuat',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2025-01-15T10:30:00Z',
    description: 'Tanggal terakhir diupdate',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
