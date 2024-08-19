import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from'typeorm';
import { AttributeOption } from'../../api/RelationalDB/attribute_option.model';

@Entity()
export class AttributeType {
    @PrimaryGeneratedColumn()
    attribute_type_id: number;

    @Column()
    attribute_name: string;

    @OneToMany(() =>AttributeOption, option => option.attribute_type)
    options: AttributeOption[];
}
