import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProductTags } from '../../utils/products.enums';
import { Product } from './product.model';

@Entity()
export class Tags {
  @PrimaryColumn('uuid')
  productId!: number;

  @Column({
    type: 'enum',
    enum: ProductTags,
    array: true,
  })
  tags!: ProductTags[];

  @ManyToOne(() => Product, (product) => product.tags)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
