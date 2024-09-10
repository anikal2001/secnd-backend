import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

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