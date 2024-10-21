import { AppDataSource } from '../database/config';
import { Seller } from '../entity/seller.entity';
import { plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';

export const SellerRepository = AppDataSource.getRepository(Seller).extend({
    async createAndSave(sellerData: Partial<Seller>): Promise<Seller | null> {
        // Check uniqueness
        const existingSeller = await AppDataSource
            .createQueryBuilder()
            .select('seller')
            .from(Seller, 'seller')
            .where('seller.email = :email', { email: sellerData.email })
            .getOne();
        if (existingSeller) {
            return null;
        }
        const seller = this.create(sellerData);
        return this.save(seller);
    },

    async getByID(sellerId: string): Promise<Seller | null> {
        return await this.createQueryBuilder('seller').where('seller.userID = :sellerId', { sellerId }).getOne();
    },

    async getSellerProducts(sellerId: string): Promise<any> {
        const Products = await this.createQueryBuilder('seller')
            .leftJoinAndSelect('seller.Products', 'product')
            .where('seller.userID = :sellerId', { sellerId })
            .getMany();
        const ProductsDTO = Products.map((product) => {
            return plainToInstance(Product, product);
        });
        return ProductsDTO;
        
    }

    // async findSellerById(sellerId: number): Promise<Seller | undefined> {
    //     return this.findOne({ where: { sellerId: sellerId } });
    // }
});
