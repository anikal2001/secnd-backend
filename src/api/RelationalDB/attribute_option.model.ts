import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from'typeorm';
import { AttributeType } from './attribute_type.model';
import { ProductAttribute } from'./product_attribute.model';

@Entity()
export class AttributeOption {
    @PrimaryGeneratedColumn()
    attribute_option_id: number;

    @Column()
    attribute_option_name: string;

    @ManyToOne(() =>AttributeType, type =>type.options)
    attribute_type: AttributeType;

    @OneToMany(() =>ProductAttribute, attribute => attribute.attributeOption)
    productAttributes: ProductAttribute[];
}
