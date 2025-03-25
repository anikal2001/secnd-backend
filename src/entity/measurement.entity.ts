import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('measurements')
export class Measurement extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  measurement_id: string;  // Auto-generated UUID for the primary key

  @Column('varchar')
  id: string;  // This will store 'chest', 'shoulderWidth', etc.

  @Column('varchar')
  label: string;  // Display label

  @Column('varchar', { nullable: true })
  custom: string;  // Custom name

  @Column('float', { nullable: true })
  value: number;  // Measurement value

  @Column('varchar')
  unit: string;  // Unit of measurement

  @ManyToOne(() => Product, product => product.measurements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
