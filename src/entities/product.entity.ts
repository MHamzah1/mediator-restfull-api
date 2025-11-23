import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// import { PropertyFeature } from './propertyFeature.entity';
// import { User } from './user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  modelName: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  basePrice: number;

  @Column({ default: 0 })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;
}
