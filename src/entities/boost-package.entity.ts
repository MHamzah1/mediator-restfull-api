import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('boost_packages')
export class BoostPackage {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Package ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Standard',
    description: 'Nama paket boost',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 34000,
    description: 'Harga paket dalam IDR',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @ApiProperty({
    example: 3,
    description: 'Durasi boost dalam hari',
  })
  @Column()
  durationDays: number;

  @ApiProperty({
    example: 12289,
    description: 'Estimasi reach minimum',
  })
  @Column()
  estimatedReachMin: number;

  @ApiProperty({
    example: 35514,
    description: 'Estimasi reach maximum',
  })
  @Column()
  estimatedReachMax: number;

  @ApiProperty({
    example: 20,
    description: 'Priority score untuk sorting',
  })
  @Column({ default: 10 })
  priorityScore: number;

  @ApiPropertyOptional({
    example: 'Paket standard untuk jangkauan menengah',
    description: 'Deskripsi paket',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: true,
    description: 'Status aktif paket',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: 1,
    description: 'Urutan tampilan',
  })
  @Column({ default: 0 })
  sortOrder: number;

  @ApiProperty({
    example: '2026-01-14T10:30:00Z',
    description: 'Tanggal dibuat',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-01-14T10:30:00Z',
    description: 'Tanggal terakhir diupdate',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
