import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne } from "typeorm";
import { Product } from "./product.entity";

@Entity()
class Image {
    @PrimaryGeneratedColumn('uuid')
    image_id!: string;
    
    @Column("varchar")
    url!: string;
    
    @ManyToOne(() => Product, (product: Product) => product.product_id)
    product_id!: string;
}

export default Image;