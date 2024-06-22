import AppDataSource from '../db/database';
import { Product } from '../../core/entity/product.model';

export const ProductRepository = AppDataSource.getRepository(Product).extend({
  async findWithColors(productId: number): Promise<Product | null> {
    const productIdStr = String(productId);
    const product = this.findOne({ where: { id: productIdStr }, relations: ['colors'] });
    return product;
  },
});
