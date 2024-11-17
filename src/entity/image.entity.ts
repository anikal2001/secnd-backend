import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
class Image {
  @PrimaryGeneratedColumn('uuid')
  image_id: string;

  @Column('varchar')
  url: string;

  @Column('varchar')
  product_id: string;

  @ManyToOne(() => Product, (product) => product.imageURLS, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

export default Image;