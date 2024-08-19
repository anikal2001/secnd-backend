import { Entity, ManyToOne, PrimaryGeneratedColumn } from'typeorm';
import { Product } from'../../core/entity/product.model';
import { AttributeOption } from'./attribute_option.model';

@Entity()
export class ProductAttribute {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() =>Product, product => product.attributes)
    product: Product;

    @ManyToOne(() =>AttributeOption, option => option.productAttributes)
    attributeOption: AttributeOption;
}
