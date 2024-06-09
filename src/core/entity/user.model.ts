import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, JoinTable } from 'typeorm';
import { Order } from './order.model';
import { Product } from './product.model';
import { Transaction } from './transaction.entity';

@Entity({ name: 'users_table' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Product, product => product.id)
  cart!: string;

  @Column({ nullable: true })
  country!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  postalCode!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  resetToken!: string;

  @Column({ nullable: true })
  expiryToken!: Date;

  @Column({ nullable: true })
  avatar!: string;

  // @Column({ nullable: true })
  // wishlist!: Product[];

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => Order, order => order.customer)
  orders!: Order[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions!: Transaction[];

  @Column({ default: false })
  isSeller!: boolean;
}
