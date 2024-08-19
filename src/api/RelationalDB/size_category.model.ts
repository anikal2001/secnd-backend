import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity()
export class SizeCategory {
    
    @PrimaryGeneratedColumn('uuid')
    category_id: number;

    @Column()
    category_name: string;
}