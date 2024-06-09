import { Product } from '../../entity/product.model';
import { getRepository } from 'typeorm';

class ListProducts {
    async execute(): Promise<Product[]> {
        const productRepository = getRepository(Product);
        return productRepository.find();
    }
}

export default ListProducts;
