import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('showrooms')
export class Showroom {
  @ApiProperty({ example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ApiProperty({ example: 'Showroom Mobil Jaya' })
  @Column({ length: 200 })
  name: string;

  @ApiProperty({ example: 'SRM-JKT01' })
  @Column({ length: 20, unique: true })
  code: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  province: string;

  @ApiPropertyOptional()
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiPropertyOptional()
  @Column({ length: 20, nullable: true })
  whatsapp: string;

  @ApiPropertyOptional()
  @Column({ length: 500, nullable: true })
  logo: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
