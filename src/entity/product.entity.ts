import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Image from './image.entity';
import { Seller } from './seller.entity';
import { ProductCategory, ProductColors, ProductStatus, ProductTags, ProductBrand, ProductCondition, ProductGender, ProductSize, ProductStyles, ProductMaterial } from '../utils/products.enums';
import { ProductInteraction } from './product_interactions.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  product_id: string;

  @Column({type: 'varchar', nullable: true})
  title: string;

  @Column({type: 'varchar', nullable: true})
  description: string;

  @Column({type: 'float', nullable: true})
  price: number;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  color: {
    primaryColor: ProductColors[];
    secondaryColor: ProductColors[];
  };

  @Column({
    type: 'simple-enum',
    enum: ProductSize,
    nullable: true,
  })
  listed_size: ProductSize;

  @Column({
    type: 'simple-enum',
    enum: ProductCategory,
    nullable: true,
  })
  product_category: ProductCategory;

  @Column({
    type: 'json',
    enum: ProductStyles,
    nullable: true,
  })
    styles: ProductStyles[];

  @Column({
    type: 'simple-enum',
    nullable: true,
    enum: ProductCondition,
  })
  condition: ProductCondition;

  @Column({
    type: 'simple-enum',
    nullable: true,
    enum: ProductBrand,
  })
  brand: ProductBrand;

  @Column({
    type: 'simple-enum',
    nullable: true,
    enum: ProductGender,
  })
  gender: ProductGender;

  @Column({ type: 'simple-array', default: [], nullable: true })
  tags: ProductTags[];

  @OneToMany(() => Image, (image) => image.product)
    @JoinColumn({ name: 'product_id' })
  imageURLS: Image[];

  @ManyToOne(() => Seller, (seller) => seller.Products, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  seller: Seller;

  @Column({
    type: 'simple-enum',
    enum: ProductMaterial,
    nullable: true,
  })
  material: ProductMaterial;

  @Column({ type: 'varchar', nullable: true })
  dimensions: string;

  @OneToMany(() => ProductInteraction, (interaction) => interaction.product)
  interactions: ProductInteraction[];

  @Column({ type: 'varchar', nullable: false })  
  status: ProductStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', nullable: false })
  updated_at: Date;
}

@Entity()
export class GeneratedResponse extends Product{
  @OneToOne(() => Product, (product) => product.product_id)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('varchar')
  title: string;

  @Column('varchar')
  description: string;

  @Column('float')
  price: number;

  @Column({
    type: 'simple-json',
    nullable: false,
  })
  color: {
    primaryColor: ProductColors[];
    secondaryColor: ProductColors[];
  };

  @Column({
    type: 'simple-enum',
    enum: ProductSize,
  })
  listed_size: ProductSize;

  @Column({
    type: 'simple-enum',
    enum: ProductCategory,
  })
  product_category: ProductCategory;

  @Column({
    type: 'json',
    enum: ProductStyles,
  })
    styles: ProductStyles[];

  @Column({
    type: 'simple-enum',
    enum: ProductCondition,
  })
  condition: ProductCondition;

  @Column({
    type: 'simple-enum',
    enum: ProductBrand,
  })
  brand: ProductBrand;

  @Column({
    type: 'simple-enum',
    enum: ProductGender,
  })
  gender: ProductGender;

  @Column({ type: 'simple-array', default: [] })
  tags: ProductTags[];

  @ManyToOne(() => Seller, (seller) => seller.Products, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  seller: Seller;

  @Column({
    type: 'simple-enum',
    enum: ProductMaterial,
  })
  material: ProductMaterial;

  @Column({ type: 'varchar', nullable: true })
  dimensions: string;

  @OneToMany(() => ProductInteraction, (interaction) => interaction.product)
  interactions: ProductInteraction[];
}