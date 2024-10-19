import { AppDataSource } from '../database/config';
import { Product } from '../entity/product.entity';
import { create } from 'domain';
import { UpdateResult } from 'typeorm';

export const ProductRepository = AppDataSource.getRepository(Product).extend({
  async findWithColors(productId: number): Promise<string> {
    const productIdStr = String(productId);
    // const product = this.findOne({ where: { id: productIdStr }, relations: ['colors'] });
    return "product";
  },
  async createAndSave(productData: Partial<Product>): Promise<Product | null> {
    const product = this.create(productData);
    // Check uniqueness
    const existingProduct = await AppDataSource
      .createQueryBuilder()
      .select('product')
      .from(Product, 'product')
      .where('product.title = :title', { title: product.title })
      .andWhere('product.seller = :seller', { seller: product.seller })
    .getOne();
    if (existingProduct) {
      return null;
    }
    try {
      return await this.save(product);
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async update(id: string, productData: Product): Promise<UpdateResult> {
    const updatedProduct = AppDataSource.createQueryBuilder()
      .update(Product)
      .set(productData)
      .where('id = :id', { id })
      .execute();
    return updatedProduct;
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
    
  }
});
