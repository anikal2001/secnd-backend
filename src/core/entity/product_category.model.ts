import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from'typeorm';
import { CategoryDimension } from'./category_dimension.model';

@Entity()
export class ProductCategory {
    @PrimaryGeneratedColumn()
    product_category_id: number;

    @Column()
    category_name: string;

    @Column({ nullable: true })
    category_image: string;

    @Column({ nullable: true })
    category_description: string;

    // Self-referencing relationship for parent category@ManyToOne(() =>ProductCategory, category => category.children)
    parent_category: ProductCategory;

    @OneToMany(() =>ProductCategory, category => category.parent_category)
    children: ProductCategory[];

    // Relationship to CategoryDimension@ManyToOne(() =>CategoryDimension, dimension => dimension.productCategories)
    category_dimension: CategoryDimension;
}
