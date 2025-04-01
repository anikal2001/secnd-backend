import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', nullable: false })
  marketplace: string;
  
  @Column({ type: 'varchar', nullable: false })
  marketplace_order_id: string;
  
  @Column({ type: 'varchar', nullable: true })
  marketplace_listing_id: string;
  
  @Column({ type: 'varchar', nullable: true })
  marketplace_transaction_id: string;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  buyer_paid: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  seller_paid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tax_amount: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency: string;
  
  @Column({ type: 'timestamp', nullable: true })
  sold_timestamp: Date;
  
  @Column({ type: 'varchar', nullable: true })
  buyer_username: string;
  
  @Column({ type: 'jsonb', nullable: true })
  buyer_address: {
    name?: string;
    street_address?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  
  @Column({ type: 'varchar', nullable: true })
  shipping_status: string;
  
  @Column({ type: 'varchar', nullable: true })
  shipping_method: string;
  
  @Column({ type: 'varchar', nullable: true })
  tracking_number: string;
  
  @Column({ type: 'varchar', nullable: true })
  shipping_carrier: string;
  
  @CreateDateColumn()
  created_at: Date;
  
  @UpdateDateColumn()
  updated_at: Date;
}