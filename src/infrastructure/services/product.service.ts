import { Product } from '../../core/entity/product.model';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProductType } from '../../types/product';

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    return await ProductRepository.find();
  }

  async getProductById(id: string): Promise<Product | null> {
    return await ProductRepository.findOne({ where: { id } });
  }

  async createProduct(productData: ProductType): Promise<Product> {
    const product = ProductRepository.create(productData);
    await ProductRepository.insert(product);
    return product;
  }
  // TODO: Clean up the updateProduct method and add more functionality
  async updateProduct(id: string, productData: Product): Promise<Product | null> {
    const product = await ProductRepository.findOne({ where: { id } });
    if (!product) return null;

    product.name = productData.name;
    product.description = productData.description;
    product.price = productData.price;

    await ProductRepository.insert(product);
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const deleteResult = await ProductRepository.delete(id);
    return (deleteResult.affected ?? 0) > 0 ? false : true;
  }
}
