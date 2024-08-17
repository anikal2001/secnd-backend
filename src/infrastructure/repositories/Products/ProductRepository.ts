import AppDataSource from '../../db/database';
import { Product } from '../../../core/entity/product.model';
import { create } from 'domain';

export const ProductRepository = AppDataSource.getRepository(Product).extend({
  async findWithColors(productId: number): Promise<string> {
    const productIdStr = String(productId);
    // const product = this.findOne({ where: { id: productIdStr }, relations: ['colors'] });
    return "product";
  },
    async createAndSave(productData: Partial<Product>): Promise<Product> {
        const product = this.create(productData);
        return this.save(product);
    }

});
