import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'simple-array'})
  items: Product[];

  @Column()
  user_id: number;

  @Column()
  quantity: number;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}