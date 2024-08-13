import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Country, States, Provinces } from '../../utils/users.enums';
class Address extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  country!: Country;

  @Column()
  province!: Provinces;

  @Column()
    city!: string;

  @Column()
    address!: string;

  @Column()
    postalCode!: string;

  @Column()
    phone!: string;
}

export default Address;
