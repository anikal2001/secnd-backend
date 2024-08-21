import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from './transaction.model';
import { Order } from './order.model';
import { ProductInteraction } from './product_interactions.model';

@Entity({ name: 'users_table' })
export abstract class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  user_id!: number;
  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column({
    type: 'simple-array',
    default: [],
  })
  cart!: string[];

  @Column()
  password!: string;

  @Column({ nullable: true })
  country!: string;

  @Column({ nullable: true })
  city!: string;

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

  @OneToMany(() => Order, (order) => order.customer)
  orders!: Order[];

  @OneToMany(() => Transaction, (transaction) => transaction.client)
  transactions!: Transaction[];
  
  @OneToMany(() => ProductInteraction, (interaction) => interaction.user)
  interactions!: ProductInteraction[];

}
