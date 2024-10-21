import { AppDataSource } from '../database/config';
import { Seller } from '../entity/seller.entity';
import { plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';

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

  async getSellerProducts(sellerId: string): Promise<any> {
    const seller = await this.createQueryBuilder('seller')
      .leftJoinAndSelect('seller.Products', 'product')
      .where('seller.user_id = :sellerId', { sellerId })
      .getOne(); // Use getOne() to fetch a single seller

    if (!seller) {
      throw new Error('Seller not found');
    }
    // Map products to DTOs (if necessary)
    const productsDTO = seller.Products.map((product) => plainToInstance(Product, product));

    return productsDTO;
  },

  async find(): Promise<any> {
    const sellers = await this.createQueryBuilder('seller')
      .leftJoin('seller.user_id', 'user')
      .select(['seller', 'user.user_id'])
      .getMany();
    return sellers
  }

  // async findSellerById(sellerId: number): Promise<Seller | undefined> {
  //     return this.findOne({ where: { sellerId: sellerId } });
  // }
});
