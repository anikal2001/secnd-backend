import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity()
export class Seller {
  @PrimaryColumn('uuid') // Primary key, matching User's primary key
  user_id: string;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' }) // This will store the user's ID as the primary key.
  user: User;

  @Column('varchar')
  email: string;

  @Column('varchar')
  store_name: string;

  @Column({ type: 'varchar', nullable: true })
  store_description: string;

  @Column({ type: 'varchar', nullable: true })
  store_logo: string;

  @OneToMany(() => Product, (product) => product.seller)
  Products: Product[];
}