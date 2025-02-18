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
  @PrimaryColumn('uuid')
  user_id: string;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
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