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
import { CarModel } from './car-model.entity';
import { User } from './user.entity';

@Entity('listings')
export class Listing {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Listing ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Seller User ID',
  })
  @Column()
  sellerId: string;

  @ApiProperty({
    description: 'Seller relation',
  })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Car Model ID',
  })
  @Column()
  carModelId: string;

  @ApiProperty({
    description: 'Car Model relation',
  })
  @ManyToOne(() => CarModel, { eager: true })
  @JoinColumn({ name: 'carModelId' })
  carModel: CarModel;

  @ApiProperty({
    example: 2020,
    description: 'Tahun produksi mobil',
  })
  @Column()
  year: number;

  @ApiProperty({
    example: 150000000,
    description: 'Harga jual mobil',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @ApiProperty({
    example: 50000,
    description: 'Kilometer mobil',
  })
  @Column()
  mileage: number;

  @ApiProperty({
    example: 'automatic',
    description: 'Jenis transmisi',
  })
  @Column()
  transmission: string;

  @ApiProperty({
    example: 'bensin',
    description: 'Jenis bahan bakar',
  })
  @Column()
  fuelType: string;

  @ApiProperty({
    example: 'Hitam Metalik',
    description: 'Warna mobil',
  })
  @Column()
  color: string;

  @ApiProperty({
    example: 'Jakarta Selatan',
    description: 'Kota lokasi mobil',
  })
  @Column()
  locationCity: string;

  @ApiProperty({
    example: 'DKI Jakarta',
    description: 'Provinsi lokasi mobil',
  })
  @Column()
  locationProvince: string;

  @ApiProperty({
    example: 'Mobil terawat, service rutin di dealer resmi',
    description: 'Deskripsi lengkap mobil',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    example: 'bekas',
    description: 'Kondisi mobil',
  })
  @Column({ default: 'bekas' })
  condition: string;

  @ApiProperty({
    example: 'Tangan Pertama',
    description: 'Status kepemilikan',
  })
  @Column({ nullable: true })
  ownershipStatus: string;

  @ApiProperty({
    example: 'Pajak Hidup',
    description: 'Status pajak',
  })
  @Column({ nullable: true })
  taxStatus: string;

  @ApiProperty({
    example: [
      'https://cdn.example.com/car1.jpg',
      'https://cdn.example.com/car2.jpg',
    ],
    description: 'Array URL gambar mobil',
  })
  @Column('simple-array')
  images: string[];

  @ApiProperty({
    example: '6281234567890',
    description: 'Nomor WhatsApp seller',
  })
  @Column()
  sellerWhatsapp: string;

  @ApiProperty({
    example: true,
    description: 'Status aktif listing',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: 125,
    description: 'Jumlah view',
  })
  @Column({ default: 0 })
  viewCount: number;

  @ApiProperty({
    example: 8,
    description: 'Jumlah klik kontak WhatsApp',
  })
  @Column({ default: 0 })
  contactClickCount: number;

  // ============ FEATURED/BOOST FIELDS ============

  @ApiProperty({
    example: false,
    description: 'Apakah listing sedang dalam status unggulan/featured',
  })
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty({
    example: '2026-01-17T00:00:00Z',
    description: 'Tanggal berakhirnya status featured',
    nullable: true,
  })
  @Column({ nullable: true })
  featuredUntil: Date;

  @ApiProperty({
    example: 20,
    description: 'Priority score untuk sorting featured listings',
  })
  @Column({ default: 0 })
  featuredPriority: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Current active boost transaction ID',
    nullable: true,
  })
  @Column({ nullable: true })
  currentBoostId: string;

  // ============ END FEATURED/BOOST FIELDS ============

  @ApiProperty({
    example: '2025-12-21T10:30:00Z',
    description: 'Tanggal dibuat',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2025-12-21T10:30:00Z',
    description: 'Tanggal terakhir diupdate',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
