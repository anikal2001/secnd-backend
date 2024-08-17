import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from'typeorm';
import { ProductCategory } from'./product_category.model';
import { Seller } from'./seller.model';
import { ProductColors as Colour } from'./color.model';
import { ProductAttribute } from'./product_attribute.model';
import { Tag } from'./tags.model';
import { ProductItem } from'./product_item.model';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    product_id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column('float')
    price: number;

    @ManyToOne(() =>Colour, colour => colour.primaryProducts)
    primaryColor: Colour;

    @ManyToOne(() =>Colour, colour => colour.secondaryProducts)
    secondaryColor: Colour;

    @Column()
    listed_size: string;

    // @ManyToOne(() =>ProductCategory, category => category.product_category_id)
    // product_category: ProductCategory;

    @Column()
    brand: string;

    @Column()
    gender: string;

    @ManyToOne(() =>Seller, seller => seller.seller_id)
    seller: Seller;

    @ManyToMany(() =>Tag, tag => tag.products)
    @JoinTable()
    tags: Tag[];

    @OneToMany(() =>ProductAttribute, attribute => attribute.product)
    attributes: ProductAttribute[];

    @OneToMany(() =>ProductItem, item => item.product)
    items: ProductItem[];
}
