import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ProductItem {
    @PrimaryGeneratedColumn()
    product_item_id: string;

    @Column()
    product_id: string;

    @Column()
    original_price: string;

    @Column()
    discount_price: number;

    @Column()
    quantity: number;
}