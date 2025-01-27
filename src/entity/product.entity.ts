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
import {
  Gender,
  Material,
  ProductColors,
  ProductStatus,
  ProductTags,
  ProductBrand,
  ProductCondition,
  ProductSize,
  ProductStyles,
} from '../utils/products.enums';
import { randomUUID } from 'crypto';
import { ProductInteraction } from './product_interactions.entity';

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

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({ type: 'simple-json', nullable: true })
  color: {
    primaryColor: ProductColors[];
    secondaryColor: ProductColors[];
  };

  @Column({ type: 'simple-enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column()
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ type: 'simple-enum', enum: ProductSize, nullable: true })
  listed_size: ProductSize;

  @Column({ type: 'json', nullable: true, enum: ProductStyles })
  styles: ProductStyles[];

  @Column({ type: 'simple-enum', nullable: true, enum: ProductCondition })
  condition: ProductCondition;

  @Column({ type: 'simple-enum', nullable: true, enum: ProductBrand })
  brand: ProductBrand;
  
  @Column({ type: 'simple-array', default: [], nullable: true })
  tags: ProductTags[];

  @OneToMany(() => Image, (image) => image.product)
  @JoinColumn({ name: 'product_id' })
  imageURLS: Image[];

  @Column({ type: 'simple-enum', enum: Material, nullable: true })
  material: Material;

  @Column({ type: 'varchar', nullable: true })
  dimensions: string;

  @OneToMany(() => ProductInteraction, (interaction) => interaction.product)
  interactions: ProductInteraction[];

  @Column({ type: 'varchar', nullable: false })
  status: ProductStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity()
export class Product extends ProductBase {
  @OneToOne(() => Product, (product) => product.product_id)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Seller, (seller) => seller.Products, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  seller: Seller;
}

@Entity()
export class GeneratedResponse extends ProductBase {}
