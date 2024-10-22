import { Seller } from '../entity/seller.entity';
import { SellerRepository } from '../repositories/seller.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AppDataSource } from '../database/config';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';
import { UserService } from './user.service';

export class SellerService {
    private userService: UserService = new UserService();

    async createSeller(createSellerDto: Seller): Promise<Seller> {
        const user = await this.userService.getUserById(createSellerDto.user_id as unknown as string);
        if (!user) {
            throw new Error('User does not exist');
        }
        const sellerData: Partial<Seller> = {
            user_id: createSellerDto.user_id,
            email: createSellerDto.email,
            store_name: createSellerDto.store_name,
            store_description: createSellerDto.store_description,
            store_logo: createSellerDto.store_logo,
        };
        const savedSeller = await SellerRepository.createAndSave(sellerData)
        await this.userService.makeUserSeller(createSellerDto.user_id as unknown as string);
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

    async getSellerById(sellerId: string): Promise<Seller | null> {
        const seller = await SellerRepository.getByID(sellerId);
        if (!seller) {
            return null;
        }
        return plainToInstance(Seller, seller);
    }

    async getSellerProducts(sellerId: string): Promise<any> {
        return await SellerRepository.getSellerProducts(sellerId);
    }

    async updateSeller(sellerId: string, updatedSeller: Seller): Promise<Seller | null> {
        const seller = await SellerRepository.getByID(sellerId);
        AppDataSource.createQueryBuilder()
            .update(Seller)
            .set(updatedSeller)
            .where('seller_id = :seller_id', { seller_id: sellerId })
            .execute();
        return null;
    }

    async deleteSeller(sellerId: string): Promise<boolean> {
        const seller = await SellerRepository.getByID(sellerId);
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
