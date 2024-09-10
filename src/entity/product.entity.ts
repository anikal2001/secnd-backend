import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Seller } from './seller.entity';
import { ProductCategory, ProductColors, ProductTags } from '../utils/products.enums';
import { ProductInteraction } from './product_interactions.entity';

@Entity()
export class Product {
  @PrimaryColumn("varchar")
  product_id: string;

  @Column("varchar")
  name: string;

  @Column("varchar")
  description: string;

  @Column('float')
  price: number;

  @Column({
    type: 'simple-json',
    nullable: false,
  })
  color: {
    primaryColor: [ProductColors];
    secondaryColor: [ProductColors];
  };

  @Column("varchar")
  listed_size: string;

  @Column({
    type: 'simple-enum',
    enum: ProductCategory,
  })
  product_category: ProductCategory;

  @Column("varchar")
  brand: string;

  @Column("varchar")
  gender: string;

  @Column({ type: 'simple-array', default: [] })
  tags: ProductTags[]

  @Column({ type: 'simple-array', default: [] })
  imageURLS: string[];

    @ManyToOne(() => Seller, (seller) => seller.seller_id, { onDelete: 'CASCADE' })
      @JoinColumn({ name: 'seller_id' })
    seller: Seller;
    
    @Column({ type: "varchar", nullable: true, default: null })
    material: string;

    @Column({ type: "varchar", nullable: true })
    dimensions: string;
  
  @OneToMany(() => ProductInteraction, interaction => interaction.product)
  @JoinColumn({ name: 'interaction_id' })
  interactions: ProductInteraction[];
}
