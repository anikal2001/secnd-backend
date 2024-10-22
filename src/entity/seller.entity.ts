import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne } from'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity()
export class Seller {
  @Column({ type: "varchar", primary: true })
  email: string;
  
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
    @Column({ type:"varchar", nullable: false })
  userID: User["user_id"];


    @Column("varchar")
    store_name: string;

    @Column({ type: "varchar", nullable: true })
    store_description: string;

    @Column({ type: "varchar", nullable: true })
  store_logo: string;
  
  @OneToMany(() => Product, product => product.userID)
  @JoinColumn({ name: 'product_id' })
  Products: Product[];
}
