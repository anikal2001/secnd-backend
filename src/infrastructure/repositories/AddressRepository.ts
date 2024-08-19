import AppDataSource from '../db/database';
import Address from '../../api/RelationalDB/address.model';

export const AddressRepository = AppDataSource.getRepository(Address).extend({});
