import { Seller } from '../../core/entity/seller.model';
import { SellerRepository } from '../repositories/sellerRepository';
import { ProductRepository } from '../repositories/Products/ProductRepository';
import AppDataSource from '../db/database';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product } from '../../core/entity/product.model';

export class SellerService {

    async createSeller(createSellerDto: Seller): Promise<Seller> {
        const sellerData: Partial<Seller> = {
            email: createSellerDto.email,
            store_name: createSellerDto.store_name,
            store_description: createSellerDto.store_description,
            store_logo: createSellerDto.store_logo,
        };
        const savedSeller = await SellerRepository.save(sellerData)
        return plainToInstance(Seller, savedSeller);
    }

    async fetchSellers(): Promise<Seller[]> {
        const sellers = await SellerRepository.find();
        if (!sellers) {
            return [];
        }
        return plainToInstance(Seller, sellers);
    }

    async getSellerById(sellerId: number): Promise<Seller | null> {
        const seller = await SellerRepository.findOneBy({ seller_id: sellerId });
        if (!seller) {
            return null;
        }
        return plainToInstance(Seller, seller);
    }

    async getSellerProducts(sellerId: number): Promise<any> {
        return await SellerRepository.getSellerProducts(sellerId);
    }

    async updateSeller(sellerId: number, updatedSeller: Seller): Promise<Seller | null> {
        const seller = await SellerRepository.findOneBy({ seller_id: sellerId });
        AppDataSource.createQueryBuilder()
            .update(Seller)
            .set(updatedSeller)
            .where('seller_id = :seller_id', { seller_id: sellerId })
            .execute();
        return null;
    }

    async deleteSeller(sellerId: number): Promise<boolean> {
        const seller = await SellerRepository.findOneBy({ seller_id: sellerId });
        if (seller) {
            await AppDataSource.createQueryBuilder().delete().from(Seller).where('seller_id = :seller_id', { sellerId }).execute();
        }
        return false;
    }

    async getTrendingProducts(sellerID: number): Promise<Product[]> {
        const trendingProducts = await ProductRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.interactions', 'interaction')
            .where('interaction.interaction_date >= :startDate', { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }) // last 7 days
            .andWhere('product.sellerId = :sellerId', { sellerID }) // Filter by specific seller
            .select('product.product_id', 'product_id')
            .addSelect('product.name', 'name')
            .addSelect('COUNT(interaction.interaction_id)', 'interaction_count')
            .groupBy('product.product_id')
            .orderBy('interaction_count', 'DESC')
            .limit(10) // Limit to top 10 trending products
            .getRawMany();
        const productDTO = trendingProducts.map((product) => {
            const instanceConversion = plainToInstance(Product, product);
            return instanceConversion

        });
        return productDTO;
    }

    // TODO: Implement the following methods
    async getSellerRevenues(sellerId: number): Promise<null> {
        return null;
    }

    async getSellerOrders(sellerId: number): Promise<null> {
        return null;
    }

    async getTopSellers(): Promise<null> {
        return null;
    }

    async getTrendingSellers(): Promise<null> {
        return null;
    }



}
