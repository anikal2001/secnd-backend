import { Entity, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, JoinColumn, JoinTable } from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity'; 

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinTable()
  customer!: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems!: OrderItem[];

  @Column("money")
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: ['recieved', 'pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status!: string;

  @Column("varchar")
  paymentMethod!: string;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order!: Order;

  @ManyToOne(() => Product)
  product!: Product;
}

