import { Product } from '../../entity/product.model';
import AppDataSource from '../../../infrastructure/db/database';

class ListProducts {
  async execute(): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    return productRepository.find();
  }
}

export default ListProducts;
