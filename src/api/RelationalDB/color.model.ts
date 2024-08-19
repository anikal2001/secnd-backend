import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../core/entity/product.model';

@Entity()
export class ProductColors {
  @PrimaryGeneratedColumn('uuid')
  id!: string;  // Primary key

  @Column({ unique: true })
  name!: string;  // Unique constraint on name

  @OneToMany(() =>Product, product => product.primaryColor)
  primaryProducts: Product[];

  @OneToMany(() =>Product, product => product.secondaryColor)
  secondaryProducts: Product[];
}


