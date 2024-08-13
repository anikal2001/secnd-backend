import { BaseEntity, Column } from 'typeorm';

export class Styles extends BaseEntity {
  @Column()
    imageUrls!: string[];

  @Column()
    name!: string;
}
