import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.model';
import { User } from './user.model';

@Entity()
export class ProductInteraction {
    @PrimaryGeneratedColumn()
    interaction_id: number;

    @ManyToOne(() => Product, product => product.interactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => User, user => user.interactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    interaction_type: string; // e.g., 'view', 'purchase', 'like'

    @Column()
    interaction_date: Date;
}