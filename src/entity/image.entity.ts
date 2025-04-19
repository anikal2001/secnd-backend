import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
class Image {
  @PrimaryGeneratedColumn('uuid')
  image_id: string;

  @Column('varchar')
  url: string;

  @Column('int', { default: 0 })
  image_type: number;

  @Column('varchar', { nullable: true })
  product_id: string | null;

  @ManyToOne(() => Product, (product) => product.imageURLS, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

export default Image;
