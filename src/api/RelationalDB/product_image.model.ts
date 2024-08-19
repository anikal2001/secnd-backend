import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProductImage {
    // Add columns and relationships as needed
    @PrimaryGeneratedColumn('uuid')
    image_id: string;

    @Column()
    product_id: string;

    @Column()
    image_url: string;
}