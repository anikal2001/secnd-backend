import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne } from'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity()
export class Seller {
  @Column({ type: "varchar", primary: true })
  email: string;
  
  @OneToOne(() => User, {nullable: false})
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @Column("varchar")
  store_name: string;

  @Column({ type: "varchar", nullable: true })
  store_description: string;

  @Column({ type: "varchar", nullable: true })
  store_logo: string;
  
  @OneToMany(() => Product, product => product.user_id)
  @JoinColumn({ name: 'product_id' })
  Products: Product[];
}
