import AppDataSource from '../db/database';
import { User } from '../../core/entity/user.model';

export const UserRepository = AppDataSource.getRepository(User).extend({
  findByName(firstName: string, lastName: string) {
    return this.createQueryBuilder('user')
      .where('user.firstName = :firstName', { firstName })
      .andWhere('user.lastName = :lastName', { lastName })
      .getMany();
  },
  findByEmail(email: string) {
    return this.createQueryBuilder('user').where('user.email = :email', { email }).getOne();
  },
  findById(id: number) {
    return this.createQueryBuilder('user').where('user.id = :id', { id }).getOne();
  },
  findByIdandRemove(id: number) {
    return this.createQueryBuilder('user').delete().from(User).where('user.id = :id', { id }).execute();
  },
});
