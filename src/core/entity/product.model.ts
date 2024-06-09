import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { ProductColors, ProductTags } from '../../utils/products.enums';
@Entity({ name: 'products_table' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column('float')
  price!: number;

  @Column({
    type: 'enum',
    enum: ProductColors,
  })
  colors!: ProductColors;

  @Column()
  size!: string;

  @Column()
  category!: string;

  @Column()
  condition!: string;

  @Column({
    type: 'enum',
    enum: ProductTags,
  })
  tags!: ProductTags;


  @Column()
  brand!: string;

  @Column()
  material!: string;

  @Column()
  gender!: string;

  @Column()
  seller!: string;

  @Column('simple-array')
  imageUrls!: string[];

}
