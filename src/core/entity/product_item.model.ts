import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from'typeorm';
import { Product } from'./product.model';
import { ProductColors } from'./color.model';

@Entity()
export class ProductItem {
    @PrimaryGeneratedColumn()
    product_item_id: number;

    @ManyToOne(() => Product, product => product.items)
    product: Product;

    @ManyToOne(() => ProductColors, colour => colour.primaryProducts)
    primaryColor: ProductColors;

    @ManyToOne(() => ProductColors, colour => colour.secondaryProducts)
    secondaryColor: ProductColors;

    @Column('float')
    sale_price: number;

    @Column('float')
    original_price: number;
}
