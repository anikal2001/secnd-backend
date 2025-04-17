import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Image from './image.entity';
import { Seller } from './seller.entity';
import { Gender, Material, ProductColors, ProductStatus, ProductTags, ProductCondition, ProductStyles } from '../utils/products.enums';
import { randomUUID } from 'crypto';
import { ProductInteraction } from './product_interactions.entity';
import { MarketplaceListing } from './marketplace.entity';

import { productSizes, ProductSize } from '../utils/product/size';
import { Measurement } from './measurement.entity';

export class Attributes {
  @Column({ type: 'simple-json', nullable: true })
  pattern: string[];

  @Column({ type: 'simple-json', nullable: true })
  waist_rise: string[];

  @Column({ type: 'simple-json', nullable: true })
  pants_length_type: string[];

  @Column({ type: 'simple-json', nullable: true })
  dress_style: string[];

  @Column({ type: 'simple-json', nullable: true })
  one_piece_style: string[];

  @Column({ type: 'simple-json', nullable: true })
  skirt_style: string[];

  @Column({ type: 'simple-json', nullable: true })
  neckline: string[];

  @Column({ type: 'simple-json', nullable: true })
  sleeve_length_type: string[];

  @Column({ type: 'simple-json', nullable: true })
  care_instructions: string[];

  @Column({ type: 'simple-json', nullable: true })
  activewear_style: string[];

  @Column({ type: 'simple-json', nullable: true })
  length_type: string[];

  @Column({ type: 'simple-json', nullable: true })
  age_group: string[];

  @Column({ type: 'simple-json', nullable: true })
  clothing_features: string[];

  @Column({ type: 'simple-json', nullable: true })
  fit: string[];

  @Column({ type: 'simple-json', nullable: true })
  best_uses: string[];

  @Column({ type: 'simple-json', nullable: true })
  outerwear_clothing_features: string[];

  @Column({ type: 'simple-json', nullable: true })
  top_length_type: string[];

  @Column({ type: 'simple-json', nullable: true })
  dress_occasion: string[];

  @Column({ type: 'simple-json', nullable: true })
  activewear_clothing_features: string[];

  @Column({ type: 'simple-json', nullable: true })
  skirt_dress_length_type: string[];
}

// Abstract base class for Product
export abstract class ProductBase {
  @PrimaryColumn('uuid')
  product_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.product_id) {
      this.product_id = randomUUID(); // Auto-generate UUID if not provided
    }
  }

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  descriptive_sentence: string;

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({ type: 'simple-array', nullable: true })
  primaryColor: string[];

  @Column({ type: 'simple-array', nullable: true })
  secondaryColor: string[];

  @Column()
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ nullable: true })
  condition_notes: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  brand_label: string;

  @Column({ nullable: true })
  made_in: string;

  @Column({ type: 'simple-array', nullable: true })
  collections: string[];

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  sku: string;

  @Column({ type: 'simple-array', nullable: true })
  source: string[];

  @Column({ nullable: true })
  fit_type: string;

  @Column({ nullable: true })
  design: string;

  @Column({ nullable: true })
  closure_type: string;

  @Column({ type: 'simple-array', default: [], nullable: true })
  tags: ProductTags[];

  @OneToMany(() => Image, (image) => image.product)
  @JoinColumn({ name: 'product_id' })
  imageURLS: Image[];

  @Column({ type: 'varchar', nullable: true })
  material: string;

  @Column({ type: 'simple-array', nullable: true })
  materials: string[];

  @Column({ type: 'varchar', nullable: true })
  dimensions: string;

  @OneToMany(() => ProductInteraction, (interaction) => interaction.product)
  interactions: ProductInteraction[];

  @Column({ type: 'varchar', nullable: false })
  status: ProductStatus;

  @Column({ type: 'simple-array', nullable: true, default: [] })
  marketplaces: string[];

  @OneToMany(() => MarketplaceListing, (listing) => listing.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  marketplaceListings: MarketplaceListing[];

  @Column({ type: 'varchar', nullable: true })
  weight: number;

  @Column({ type: 'varchar', nullable: true })
  packageLength: number;

  @Column({ type: 'varchar', nullable: true })
  packageWidth: number;

  @Column({ type: 'varchar', nullable: true })
  packageHeight: number;

  @Column({ type: 'varchar', nullable: true })
  shippingPrice: number;

  @Column({ type: 'varchar', nullable: true })
  shippingProfile: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity()
export class ProductImport extends ProductBase {
  @BeforeInsert()
  generateId() {
    if (!this.product_id) {
      this.product_id = randomUUID(); // Auto-generate UUID if not provided
    }
  }

  @Column({ type: 'simple-json', nullable: true })
  color: {
    primaryColor: string[];
    secondaryColor: string[];
  };

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column({ type: 'varchar', nullable: true })
  listed_size: string;

  @Column({ type: 'simple-json', nullable: true })
  styles: string[];

  @Column({ type: 'varchar', nullable: true })
  condition: string;

  @Column(() => Attributes)
  attributes: Attributes;

  @Column({ type: 'simple-json', nullable: true })
  image_urls: string[];

  @OneToMany(() => MarketplaceListing, (listing) => listing.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  marketplaceListings: MarketplaceListing[];

  @ManyToOne(() => Seller, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  seller: Seller;
}

@Entity()
export class Product extends ProductBase {
  // Removed self-referencing OneToOne relationship which could be causing deletion issues

  @ManyToOne(() => Seller, (seller) => seller.Products, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  seller: Seller;

  @Column({ type: 'simple-json', nullable: true })
  color: {
    primaryColor: ProductColors[];
    secondaryColor: ProductColors[];
  };

  @Column({ type: 'simple-enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'enum', enum: productSizes, nullable: true })
  listed_size: ProductSize;

  @Column({ type: 'json', nullable: true, enum: ProductStyles })
  styles: ProductStyles[];

  @Column({ type: 'simple-enum', nullable: true, enum: ProductCondition })
  condition: ProductCondition;

  @Column({ type: 'simple-enum', enum: Material, nullable: true })
  material: Material;

  @OneToMany(() => Measurement, (measurement) => measurement.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  measurements: Measurement[];

  @OneToMany(() => MarketplaceListing, (listing) => listing.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  marketplaceListings: MarketplaceListing[];

  @Column(() => Attributes)
  attributes: Attributes;
}

@Entity()
export class GeneratedResponse extends ProductBase {
  @ManyToOne(() => Seller, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  seller: Seller;

  @Column({ nullable: true })
  user_id: string;

  @Column({ type: 'simple-json', nullable: true })
  color: {
    primaryColor: ProductColors[];
    secondaryColor: ProductColors[];
  };

  @Column({ type: 'enum', enum: productSizes, nullable: true })
  listed_size: ProductSize;

  @Column({ type: 'json', nullable: true, enum: ProductStyles })
  styles: ProductStyles[];

  @Column({ type: 'simple-enum', nullable: true, enum: ProductCondition })
  condition: ProductCondition;

  @Column({ type: 'simple-enum', enum: Material, nullable: true })
  material: Material;

  @OneToMany(() => Measurement, (measurement) => measurement.product, {
    cascade: true,
  })
  measurements: Measurement[];

  @Column(() => Attributes)
  attributes: Attributes;
}
