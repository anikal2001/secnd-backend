import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProductColors } from '../../utils/products.enums';
import { Product } from './product.model';

@Entity()
export class Colors {
  @PrimaryColumn('uuid')
  productId!: number;

  @Column({
    type: 'enum',
    enum: ProductColors,
    array: true,
  })
  colors!: ProductColors[];

  @ManyToOne(() => Product, (product) => product.primaryColors)
  @ManyToOne(() => Product, (product) => product.secondaryColors)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
