import { AppDataSource } from '../database/config';
import { User } from '../entity/user.entity';

export const UserRepository = AppDataSource.getRepository(User).extend({
  createAndSave(userid: string, firstName: string, lastName: string, email: string, password: string, postalCode: string, phone: string, country: string, city: string) { 
    return this.createQueryBuilder('user')
      .insert()
      .into(User)
      .values([{
        user_id: userid, 
        first_name: firstName,
        last_name: lastName,
        country: country,
        city: city,
        postalCode: postalCode,
        phone: phone,
        email: email,
        password: password,
        is_seller: false,
        resetToken: '',
        expiryToken: (new Date().getUTCSeconds()).toString(),
        avatar: '',
        cart: [],
        orders: [],
        transactions: [],
        interactions: [],
      }])
      .execute();
  },
  findByName(firstName: string, lastName: string) {
    return this.createQueryBuilder('user')
      .where('user.firstName = :firstName', { firstName })
      .andWhere('user.lastName = :lastName', { lastName })
      .getMany();
  },
  findByEmail(email: string) {
    return this.createQueryBuilder('user_table').where('user_table.email = :email', { email }).getOne();
  },
  findByEmailAndRemove(email: string) {
    return this.createQueryBuilder('user').delete().from('users_table').where('email = :email', { email }).execute();
  },
  findById(id: number) {
    return this.createQueryBuilder('user_table').where('user_table.user_id = :id', { id }).getOne();
  },
  findByIdandRemove(id: number) {
    return this.createQueryBuilder('user_table').delete().from(User).where('user_table.id = :id', { id }).execute();
  },
  isSeller(email: string) {
    return this.createQueryBuilder('user_table').where('user_table.email = :email', { email }).andWhere('user_table.is_seller = true').getOne();
  },
  makeSeller(email: string) {
    return this.createQueryBuilder('user_table').update(User).set({ is_seller: true }).where('email = :email', { email }).execute();
  }
});
