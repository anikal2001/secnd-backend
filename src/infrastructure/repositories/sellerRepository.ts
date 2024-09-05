import AppDataSource from '../db/database';
import { SellerDTO as Seller } from '../dto/SellerDTO';
import { plainToInstance } from 'class-transformer';
import { ProductDto as Product } from '../dto/ProductDTO';

export const SellerRepository = AppDataSource.getRepository(Seller).extend({
    async createAndSave(sellerData: Partial<Seller>): Promise<Seller> {
        const seller = this.create(sellerData);
        return this.save(seller);
    },

    async getSellerProducts(sellerId: number): Promise<any> {
        const Products = await this.createQueryBuilder('seller')
            .leftJoinAndSelect('seller.products', 'product')
            .where('seller.seller_id = :sellerId', { sellerId })
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
