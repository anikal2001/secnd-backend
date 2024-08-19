import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from'typeorm';
import { Product } from './product.model';

@Entity()
export class Seller {
    @PrimaryGeneratedColumn()
    seller_id: number;

    @Column()
    email: string;

    @Column()
    store_name: string;

    @Column({ nullable: true })
    store_description: string;

    @Column({ nullable: true })
  store_logo: string;
  
  @OneToMany(() => Product, product => product.seller)
  @JoinColumn({ name: 'product_id' })
  Products: Product[];
}
