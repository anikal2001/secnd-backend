import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Order } from './order.entity';
import { ProductInteraction } from './product_interactions.entity';

@Entity({ name: 'users_table' })
export abstract class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  user_id!: string;

  @Column("varchar")
  first_name!: string;

  @Column("varchar")
  last_name!: string;

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

  @Column({ type: 'varchar', nullable: true })
  country!: string;

  @Column({ type: 'varchar', nullable: true })
    province!: string;

  @Column({ type: 'varchar', nullable: true })
  city!: string;

  @Column({ type: 'varchar', nullable: true })
  postalCode!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  resetToken!: string;

  @Column({ type: "varchar", nullable: true })
  expiryToken!: string;

  @Column({ type: 'varchar', nullable: true })
  avatar!: string;

  // @Column({ nullable: true })
  // wishlist!: Product[];

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @Column({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @OneToMany(() => Order, (order) => order.customer)
  orders!: Order[];

  @OneToMany(() => Transaction, (transaction) => transaction.client)
  transactions!: Transaction[];
  
  @OneToMany(() => ProductInteraction, (interaction) => interaction.user)
  interactions!: ProductInteraction[];

  @Column({ type: "boolean", default: false })
  is_seller!: boolean;

}
