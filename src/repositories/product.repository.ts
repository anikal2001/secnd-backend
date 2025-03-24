import { AppDataSource } from '../database/config';
import { Product } from '../entity/product.entity';
import { Seller } from '../entity/seller.entity';
import { UpdateResult } from 'typeorm';

export const ProductRepository = AppDataSource.getRepository(Product).extend({
  async findWithColors(productId: number): Promise<string> {
    const productIdStr = String(productId);
    // const product = this.findOne({ where: { id: productIdStr }, relations: ['colors'] });
    return "product";
  },
  
  async createAndSave(productData: Partial<Product>, user_id: string): Promise<Product | null> {
    // Fetch the seller by user ID
    const seller = await AppDataSource.createQueryBuilder()
      .select('seller')
      .from(Seller, 'seller')
      .where('seller.user_id = :user_id', { user_id: user_id }) // Use user.user_id as a string
      .getOne();
    if (!seller) {
      throw new Error('Seller not found');
    }
  
    // Create the product and assign the seller
    const product = this.create({
      ...productData,
      seller,
    });
  
    try {
      return await this.save(product);
    } catch (error) {
      console.error('Error saving product:', error);
      return null;
    }
  },

  async update(id: string, productData: Partial<Product>): Promise<UpdateResult> {
    const updateResult = await this.createQueryBuilder()
      .update(Product)
      .set(productData)
      .where('product_id = :id', { id })
      .execute();
    return updateResult;
  },

  async findTrendingProducts(): Promise<Product[]> {
    return await AppDataSource.createQueryBuilder().select('product')
      .from(Product, 'product').orderBy('product.views', 'DESC').getMany();
  },
  
  async findByTags(tag: string): Promise<Product[]> {
    return await AppDataSource.createQueryBuilder().select('product')
      .from(Product, 'product').where('product.tags = :tag', { tag }).getMany();
  },
  
  async bulkCreate(products: Product[]): Promise<Product[]> {
    // bulk create products
    const createdProducts = await this.save(products);
    return createdProducts;
  },

  async filterProducts(filter: any): Promise<Product[]> {
    const queryBuilder = AppDataSource.createQueryBuilder().select('product')
    if (filter.upperPrice) {
      queryBuilder.where('product.price < :price', { price: filter.upperPrice });
      queryBuilder.andWhere('product.price > :price', { price: filter.lowerPrice ? filter.lowerPrice : 0 });
    }
    if (filter.category) {
      queryBuilder.andWhere('product.product_category = :category', { category: filter.category });
    }
    if (filter.brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand: filter.brand });
    }
    if (filter.color) {
      queryBuilder.andWhere('product.color = :color', { color: filter.color });
    }
    if (filter.size) {
      queryBuilder.andWhere('product.listed_size = :size', { size: filter.size });
    }
    if (filter.condition) {
      queryBuilder.andWhere('product.condition = :condition', { condition: filter.condition });
    }
    return queryBuilder.getMany();
  },
  
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const result = await this.delete({ product_id: productId });
      return result.affected !== null && result.affected !== undefined && result.affected > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }
});
