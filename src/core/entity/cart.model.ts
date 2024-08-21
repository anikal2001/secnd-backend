import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.model';
import { Product } from './product.model';

@Entity()
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    cart_id: string;

    @Column()
    @OneToOne(() => User)
    user_id: string;

    @OneToMany(() => Product, product => product.product_id)
        @JoinColumn({ name: 'product_id' })
    products: Product[];
}