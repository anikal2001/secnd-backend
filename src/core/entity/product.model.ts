import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Seller } from './seller.model';
import { ProductCategory, ProductColors, ProductTags } from '../../utils/products.enums';
import { ProductInteraction } from './product_interactions.model';

@Entity()
export class Product {
  @PrimaryColumn()
  product_id: string;

  @Column()
  name: string;

  @Column()
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

  @Column()
  listed_size: string;

  @Column({
    type: 'simple-enum',
    enum: ProductCategory,
  })
  product_category: ProductCategory;

  @Column()
  brand: string;

  @Column()
  gender: string;

  @Column({ type: 'simple-array', default: [] })
  tags: ProductTags[]

  @Column({ type: 'simple-array', default: [] })
  imageURLS: string[];

    @ManyToOne(() => Seller, (seller) => seller.seller_id, { onDelete: 'CASCADE' })
      @JoinColumn({ name: 'seller_id' })
    seller: Seller;
    
    @Column({ nullable: true })
    material: string;

    @Column({ nullable: true })
    dimensions: string;
  
  @OneToMany(() => ProductInteraction, interaction => interaction.product)
  @JoinColumn({ name: 'interaction_id' })
  interactions: ProductInteraction[];
}
