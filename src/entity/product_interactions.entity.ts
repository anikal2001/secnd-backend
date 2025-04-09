import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity()
export class ProductInteraction {
    @PrimaryGeneratedColumn()
    interaction_id: number;

    @Column("varchar") 
    marketplace_id: string;

    @Column("varchar")
    interaction_type: string; // e.g., 'view', 'purchase', 'like'

    @Column("date", { nullable: true })
    interaction_date: Date;

    @ManyToOne(() => Product, product => product.interactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
