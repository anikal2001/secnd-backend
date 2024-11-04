import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { Product } from "./product.entity";

@Entity()
class Image {
    @PrimaryGeneratedColumn('uuid')
    image_id!: string;
    
    @Column("varchar")
    url!: string;
    
    @OneToOne(() => Product, (product: Product) => product.product_id)
    @Column({ type: "varchar", nullable: true})
    product_id!: string;
}

export default Image;