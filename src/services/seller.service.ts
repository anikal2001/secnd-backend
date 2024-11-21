import { Seller } from '../entity/seller.entity';
import { SellerRepository } from '../repositories/seller.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AppDataSource } from '../database/config';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';
import { UserService } from './user.service';
import { User } from '../entity/user.entity';
import { ProductFilter, PaginationOptions, PaginatedProducts } from '../interfaces/product.filter';
import { ProductStatus } from '../utils/products.enums';

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
    const savedSeller = await SellerRepository.createAndSave(sellerData);
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
      return instanceConversion;
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

  async getSellerProducts(filter: ProductFilter, pagination?: PaginationOptions): Promise<PaginatedProducts> {
    try {
      return await SellerRepository.getSellerProducts(filter, pagination);
    } catch (error) {
      console.error('Error getting seller products:', error);
      throw error;
    }
  }

  async updateSeller(sellerId: string, updatedSeller: Seller): Promise<Seller | null> {
    const seller = await SellerRepository.getByID(sellerId);
    AppDataSource.createQueryBuilder().update(Seller).set(updatedSeller).where('seller_id = :seller_id', { seller_id: sellerId }).execute();
    return null;
  }

  async deleteSeller(sellerId: string): Promise<boolean> {
    const seller = await SellerRepository.getByID(sellerId);
    if (seller) {
      await AppDataSource.createQueryBuilder().delete().from(Seller).where('seller_id = :seller_id', { sellerId }).execute();
    }
    return false;
  }

  async getTrendingProducts(sellerID: string): Promise<Product[]> {
    const trendingProducts = await ProductRepository.createQueryBuilder('product')
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
      return instanceConversion;
    });
    return productDTO;
  }

  async getSellerRevenues(sellerID: string): Promise<number> {
    const filter: ProductFilter = {
        sellerId: sellerID
    };
    const sellerProducts = await SellerRepository.getSellerProducts(filter);

    if (!sellerProducts || !sellerProducts.products || sellerProducts.products.length === 0) {
        return 0;
    }

    const totalRevenue = sellerProducts.products.reduce((acc: number, product: Product) => {
        if (product.status === ProductStatus.sold) {
            return acc + (product.price || 0);
        }
        return acc;
    }, 0);

    return totalRevenue;
}

  async getSellerOrders(sellerID: string): Promise<number> {
    try {
      const filter: ProductFilter = {
        sellerId: sellerID,
        status: ProductStatus.sold
      };

      const sellerProducts = await SellerRepository.getSellerProducts(filter);

      // Return total number of sold products
      return sellerProducts.total || 0;
    } catch (error) {
      console.error('Error getting seller orders:', error);
      return 0;
    }
  }

  async getSellerCustomers(sellerID: string): Promise<User[]> {
    try {
      const customers = await AppDataSource.getRepository(User)
        .createQueryBuilder('user')
        .innerJoin('user.orders', 'order')
        .innerJoin('order.orderItems', 'orderItem')
        .innerJoin('orderItem.product', 'product')
        .where('product.seller = :sellerID', { sellerID })
        .distinct(true)
        .getMany();

      return customers;
    } catch (error) {
      console.error('Error fetching seller customers:', error);
      throw new Error('Failed to fetch seller customers');
    }
  }

  async getTopSellers(): Promise<null> {
    return null;
  }

  async getTrendingSellers(): Promise<null> {
    return null;
  }

  async getSellerCategoryCounts(sellerID: string): Promise<{ [key: string]: number }> {
    try {
      const filter: ProductFilter = {
        sellerId: sellerID,
        status: ProductStatus.active
      };

      const products = await SellerRepository.getSellerProducts(filter);

      // Initialize counts object
      const categoryCounts: { [key: string]: number } = {};

      // Count products by category
      products.products.forEach((product: Product) => {
        const category = product.product_category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      return categoryCounts;
    } catch (error) {
      console.error('Error getting seller category counts:', error);
      throw error;
    }
  }
}
