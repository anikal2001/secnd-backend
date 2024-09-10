import bcrypt from 'bcrypt';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';
import { ProductFilters, ProductType } from '../types/product';
import { ProductCategory, ProductTags } from '../utils/products.enums';
import { ProductRepository } from '../repositories/product.repository';

export class ProductService {

  // Get Methods
  async fetchProducts(): Promise<Product[]> {
    // If the id is undefined, it will return all orders
    const products = await ProductRepository.find();
    if (!products) {
      return [];
    }
    return plainToInstance(Product, products);
  }

  async getTrendingProducts(): Promise<Product[]> {
    // Current Products that have the most wishlist + likes + views
    const trendingProducts = await ProductRepository.findTrendingProducts();
    return trendingProducts;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    if (category in ProductCategory) {
      throw new Error('Invalid category');
    }
    const categoryKey = category as keyof typeof ProductCategory;
    const products = await ProductRepository.findBy({ product_category: ProductCategory[categoryKey] });
    if (!products) {
      return [];
    }
    return plainToInstance(Product, products);
  }

    async getProductsByStyle(tag: string): Promise<Product[]> {
    if (tag in ProductCategory) {
      throw new Error('Invalid category');
    }
    const tagKey = tag as keyof typeof ProductCategory;
    const products = await ProductRepository.findByTags(tagKey);
    if (!products) {
      return [];
    }
    return products;
    }
  
  async filterProducts(filter: ProductFilters): Promise<Product[]> {
    const products = await ProductRepository.filterProducts(filter);
    if (!products) {
      return [];
    }
    return products;
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await ProductRepository.findOneBy({ product_id: id });
    if (!product) {
      return null
    }
    return plainToInstance(Product, product);
  } 

  // Post Methods
  async createProduct(productData: ProductType): Promise<Product | null> {
    productData.product_id = await this._genProductId(productData.seller.toString(), productData.name);
    const newProduct = plainToClass(Product, productData);
    try {
      const product = await ProductRepository.createAndSave(newProduct);
      return product;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateProduct(id: string, productData: ProductType): Promise<boolean> {
    const updatedProduct = plainToClass(Product, productData);
    const UpdateResult = await ProductRepository.update(id, updatedProduct);
    if (UpdateResult.affected === 0) {
      return false
    }
    else {
      return true;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await ProductRepository.findOneBy({ product_id: id });
    if (!product) {
      return false;
    }
    const deletedProduct = await ProductRepository.remove(product);
    if (!deletedProduct) {
      throw new Error('Failed to delete product');
    }
    return true;
  }

  // Private Methods
  async _genProductId(sellerId: string, productName: string): Promise<string> {
    return await bcrypt.hashSync(sellerId + productName.toLowerCase(), 10);
  }
}
