// src/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email user',
  })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Nama lengkap user',
  })
  @Column()
  fullName: string;

  @ApiProperty({
    example: '+628123456789',
    description: 'Nomor telepon',
  })
  @Column()
  phoneNumber: string;

  @ApiPropertyOptional({
    example: '6281234567890',
    description: 'Nomor WhatsApp untuk marketplace (format: 628xxx)',
  })
  @Column({ nullable: true })
  whatsappNumber: string;

  @ApiPropertyOptional({
    example: 'Jakarta Selatan',
    description: 'Lokasi user untuk marketplace',
  })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({
    example: 'customer',
    description: 'Role user',
    enum: [
      'customer',
      'admin',
      'salesman',
      'showroom_owner',
      'warehouse_admin',
      'inspector',
      'mechanic',
    ],
  })
  @Column()
  role:
    | 'customer'
    | 'admin'
    | 'salesman'
    | 'showroom_owner'
    | 'warehouse_admin'
    | 'inspector'
    | 'mechanic';

  @ApiProperty({
    example: '2025-01-15T10:30:00Z',
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

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
