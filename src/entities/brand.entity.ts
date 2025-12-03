import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('brands')
export class Brand {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Brand ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Toyota',
    description: 'Nama brand',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: 'Manufacturer dari Jepang',
    description: 'Deskripsi brand',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'https://cdn.example.com/logo/toyota.png',
    description: 'URL logo brand',
  })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty({
    example: true,
    description: 'Status aktif brand',
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
