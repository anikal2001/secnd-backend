import { Seller } from '../entity/seller.entity';
import { SellerRepository } from '../repositories/seller.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AppDataSource } from '../database/config';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product } from  '../entity/product.entity';

export class SellerService {

    async createSeller(createSellerDto: Seller): Promise<Seller> {
        const sellerData: Partial<Seller> = {
            email: createSellerDto.email,
            store_name: createSellerDto.store_name,
            store_description: createSellerDto.store_description,
            store_logo: createSellerDto.store_logo,
        };
        const savedSeller = await SellerRepository.createAndSave(sellerData)
        return plainToInstance(Seller, savedSeller);
    }

    async fetchSellers(): Promise<Seller[]> {
        const sellers = await SellerRepository.find();
        if (!sellers) {
            return [];
        }
        const sellerDTO = sellers.map((seller: Seller) => {
            const instanceConversion = plainToInstance(Seller, seller);
            return instanceConversion
        });
        return sellerDTO;
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
            .addSelect('product.title', 'title')
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
