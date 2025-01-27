import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
export class Address extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    street: string;

    @Column('varchar')
    city: string;

    @Column('varchar')
    state: string;

    @Column('varchar')
    country: string;

    @Column('varchar')
    postalCode: string;

    @Column('boolean', { default: false })
    isDefault: boolean;

    @Column('varchar', { nullable: true })
    phone: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column('uuid')
    userId: string;
}