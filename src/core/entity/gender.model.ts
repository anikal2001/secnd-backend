import { BaseEntity, Column, Entity } from "typeorm";

@Entity()
export class Gender {
    @Column({ primary: true })
    id!: string;

    @Column()
    name!: string;
}