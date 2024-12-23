import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Product } from "./product.entity";

export enum ImageType {
  FRONT = 0,
  BACK = 1,
  LABEL = 2,
  ADDITIONAL = 3
}

@Entity()
class Image {
  @PrimaryGeneratedColumn('uuid')
  image_id: string;

  @Column('varchar')
  url: string;

  @Column({
    type: 'enum',
    enum: ImageType,
    default: ImageType.ADDITIONAL
  })
  image_type: ImageType;

  @Column('varchar', { nullable: true })
  product_id: string | null;

  @ManyToOne(() => Product, (product) => product.imageURLS, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

export default Image;