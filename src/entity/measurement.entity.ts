import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('measurements')
export class Measurement extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('float')
    height: number;

    @Column('float')
    chest: number;

    @Column('float')
    shoulder: number;

    @Column('float')
    sleeve: number;

    @Column('float')
    wrist: number;

    @Column('float')
    waist: number;

    @Column('float')
    hips: number;

    @Column('float')
    inseam: number;

    @Column('float')
    rise: number;

    @Column({
        type: 'enum',
        enum: ['imperial', 'metric'],
        default: 'metric'
    })
    unit: 'imperial' | 'metric';

    @OneToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column('uuid')
    userId: string;
}