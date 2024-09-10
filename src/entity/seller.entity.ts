import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from'typeorm';
import { Product } from './product.entity';

@Entity()
export class Seller {
    @PrimaryGeneratedColumn()
    seller_id: number;

    @Column("varchar")
    email: string;

    @Column("varchar")
    store_name: string;

    @Column({ type: "varchar", nullable: true })
    store_description: string;

    @Column({ type: "varchar", nullable: true })
  store_logo: string;
  
  @OneToMany(() => Product, product => product.seller)
  @JoinColumn({ name: 'product_id' })
  Products: Product[];
}
