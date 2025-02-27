import { AppDataSource } from '../database/config';
import { Seller } from '../entity/seller.entity';
import { plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';
import { User } from '../entity/user.entity';
import { ProductFilter, PaginationOptions, PaginatedProducts } from '../interfaces/product.filter';
import { MarketplaceService } from '../services/marketplace.service';

export const SellerRepository = AppDataSource.getRepository(Seller).extend({
  async createAndSave(sellerData: Partial<Seller>): Promise<Seller | null> {
    // Check uniqueness
    const existingSeller = await AppDataSource.createQueryBuilder()
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
    return await this.createQueryBuilder('seller').where('seller.user_id = :sellerId', { sellerId }).getOne();
  },

  async getSellerProducts(filter: ProductFilter, pagination?: PaginationOptions): Promise<PaginatedProducts> {
    try {
      const productRepository = AppDataSource.getRepository(Product);
      let queryBuilder = productRepository.createQueryBuilder('product');

      // Base conditions
      queryBuilder = queryBuilder.where('product.user_id = :sellerId', { sellerId: filter.sellerId });

      // Optional joins
      if (filter.includeImages) {
        queryBuilder = queryBuilder.leftJoinAndSelect('product.imageURLS', 'imageURLS');
      }

      // Apply filters
      if (filter.category) {
        queryBuilder = queryBuilder.andWhere('product.product_category = :category', { category: filter.category });
      }

      if (filter.status !== undefined) {
        queryBuilder = queryBuilder.andWhere('product.status = :status', { status: filter.status });
      }

      if (filter.startDate) {
        queryBuilder = queryBuilder.andWhere('product.created_at >= :startDate', { startDate: filter.startDate });
      }

      if (filter.endDate) {
        queryBuilder = queryBuilder.andWhere('product.created_at <= :endDate', { endDate: filter.endDate });
      }

      if (filter.marketplaces) {
        // Here we assume that a relation to marketplace listings exists and that you want to filter on that
        queryBuilder = queryBuilder
          .leftJoinAndSelect('product.marketplaceListings', 'marketplaceListings')
          .andWhere('marketplaceListings.marketplace IN (:...marketplaces)', { marketplaces: filter.marketplaces });
      } else {
        // Still join marketplaceListings so we can format them later
        queryBuilder = queryBuilder.leftJoinAndSelect('product.marketplaceListings', 'marketplaceListings');
      }

      // Get total count before pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      if (pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        queryBuilder = queryBuilder.skip((page - 1) * limit).take(limit);
      }

      // Get products with ordering
      const products = await queryBuilder.orderBy('product.created_at', 'DESC').getMany();

      // Transform the marketplace listings for each product
      const productsWithFormattedListings = products.map((product) => {
        if (product.marketplaceListings) {
          product.marketplaceListings = MarketplaceService.formatListings(product.marketplaceListings);
        }
        const { marketplaces, ...productWithoutMarketplaces } = product;
        return productWithoutMarketplaces;
      });

      return {
        products: productsWithFormattedListings,
        total,
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        totalPages: pagination ? Math.ceil(total / (pagination.limit || 10)) : 1,
      };
    } catch (error) {
      console.error('Error in getSellerProducts:', error);
      throw error;
    }
  },

  async find(): Promise<any> {
    return await this.createQueryBuilder('seller').leftJoinAndSelect('seller.user', 'user').getMany();
  },

  async findByUserId(userId: string): Promise<Seller | null> {
    return await this.createQueryBuilder('seller').where('seller.user_id = :userId', { userId }).leftJoinAndSelect('seller.user', 'user').getOne();
  },
});
