import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  modelName: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  basePrice: number;

  @Column({ default: '' })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;
}
