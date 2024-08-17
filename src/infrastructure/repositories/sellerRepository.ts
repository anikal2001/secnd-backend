import AppDataSource from '../db/database';
import { Seller } from '../../core/entity/seller.model';

export const SellerRepository = AppDataSource.getRepository(Seller).extend({
    async createAndSave(sellerData: Partial<Seller>): Promise<Seller> {
        const seller = this.create(sellerData);
        return this.save(seller);
    }

    // async findSellerById(sellerId: number): Promise<Seller | undefined> {
    //     return this.findOne({ where: { sellerId: sellerId } });
    // }
});
