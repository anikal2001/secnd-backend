import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from 'typeorm';
import { ProductColors, ProductGender, ProductSize, ProductTags } from '../../utils/products.enums';

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

  @Column({ nullable: true })
  @Column({
    type: 'enum',
    enum: ProductColors,
  })
  primaryColors!: [ProductColors];

  @Column({ nullable: true })
  @Column({
    type: 'enum',
    enum: ProductColors,
  })
    secondaryColors!: [ProductColors];

  @Column()
    size!: ProductSize;

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
    gender!: ProductGender;

  @Column('simple-array')
  imageUrls!: string[];
}
