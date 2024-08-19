import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Measurement {
    @PrimaryGeneratedColumn()
    measurement_id: number;

    @Column()
    measurement_system: string;

    @Column()
    measurement_unit: string;
}
