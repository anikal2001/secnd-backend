import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from './transaction.model';
import { Order } from './order.model';
import { ProductInteraction } from './product_interactions.model';

@Entity({ name: 'users_table' })
export abstract class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  user_id!: number;
  @Column("varchar")
  firstName!: string;

  @Column("varchar")
  lastName!: string;

  @Column({
    type: 'varchar',
    unique: true,
  })
  email!: string;

  @Column({
    type: 'simple-array',
    default: [],
  })
  cart!: string[];

  @Column("varchar")
  password!: string;

  @Column({ type: 'simple-array', nullable: true })
  country!: string;

  @Column({ type: 'varchar', nullable: true })
  city!: string;

  @Column({ type: 'varchar', nullable: true })
  postalCode!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  resetToken!: string;

  @Column({ type: "date", nullable: true })
  expiryToken!: Date;

  @Column({ type: 'varchar', nullable: true })
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

  @Column({ type: "boolean", default: false })
  isSeller!: boolean;

}
