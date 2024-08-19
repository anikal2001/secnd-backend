import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from'typeorm';
import { Product } from '../../core/entity/product.model';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    tag_id: number;

    @Column()
    tag_name: string;

    @ManyToMany(() =>Product, product => product.tags)
    products: Product[];
}
