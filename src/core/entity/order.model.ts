import { Entity, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, JoinColumn, JoinTable } from 'typeorm';
import { Product } from './product.model'; // Assuming Product entity is defined elsewhere
import { User } from './user.model'; // Assuming User entity is defined elsewhere

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @ManyToOne(() => User, user => user.orders)
    @JoinTable()
    customer!: User;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    orderItems!: OrderItem[];

    @Column()
    totalAmount!: number;

    @Column({
        type: 'enum',
        enum: ['recieved', 'pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    })
    status!: string;

    @Column()
    paymentMethod!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Order, order => order.orderItems)
    order!: Order;

    @ManyToOne(() => Product)
    product!: Product;
}
