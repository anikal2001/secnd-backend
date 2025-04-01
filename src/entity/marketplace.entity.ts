import { Entity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class MarketplaceListing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column() // name of marketplace
  marketplace: string;

  @Column()
  marketplace_id: string;

  @Column({ nullable: true })
  slug?: string;

  @Column({ nullable: true })
  status?: string;
}