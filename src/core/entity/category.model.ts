import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ProductCategory {
    @PrimaryGeneratedColumn()
    category_id: number;

    @Column()
    category_name: string;

    @Column()
    category_image: string;
    // Add more columns and relationships as needed
}