import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from'typeorm';
import { ProductCategory } from './product_category.model';

@Entity()
export class CategoryDimension {
    @PrimaryGeneratedColumn()
    category_dimension_id: number;

    @Column()
    category_name: string;

    @Column()
    dimension_name: string;

    @OneToMany(() =>ProductCategory, category => category.category_dimension)
    productCategories: ProductCategory[];
}
