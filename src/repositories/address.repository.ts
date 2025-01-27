import { AppDataSource } from "../database/config";
import { Address } from "../entity/address.entity";

export const AddressRepository = AppDataSource.getRepository(Address).extend({
    async findByUserId(userId: string): Promise<Address[]> {
        return await this.find({
            where: { userId: userId }
        });
    },

    async findDefaultByUserId(userId: string): Promise<Address | null> {
        return await this.findOne({
            where: { userId: userId, isDefault: true }
        });
    }
});