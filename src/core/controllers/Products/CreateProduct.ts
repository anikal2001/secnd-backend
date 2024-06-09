import { Product } from '../../entity/product.model';
import { getRepository } from 'typeorm';

interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    categoryId: number;
}

class CreateProduct {
    async execute(createProductRequest: CreateProductRequest): Promise<Product> {
        const productRepository = getRepository(Product);
        const newProduct = productRepository.create(createProductRequest);

        await productRepository.save(newExample);
        return newProduct;
    }
}

export default CreateProduct;
