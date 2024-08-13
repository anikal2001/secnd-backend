import AppDataSource from '../db/database';
import Address from '../../core/entity/address.model';

export const AddressRepository = AppDataSource.getRepository(Address).extend({});
