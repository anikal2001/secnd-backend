import bcrypt from 'bcrypt';
import { PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import S3 from '../utils/AWSClient';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';
import { ProductFilters, ProductType } from '../types/product';
import { ProductCategory, ProductTags } from '../utils/products.enums';
import { ProductRepository } from '../repositories/product.repository';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { UserService } from './user.service';
import { main } from '../utils/OpenAPI';

export class ProductService {
  private UserService: UserService = new UserService();

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
      return null;
    }
    return plainToInstance(Product, product);
  }
  async generateProductDetails(imageFiles: Express.Multer.File[]): Promise<any> {
    // Upload images to AWS S3
    const imageUrls = await this._uploadImageAWS(imageFiles);
    console.log(imageUrls);
    // Call ChatGPT API to generate product details
    const res = main(imageUrls[0]).catch((err) => {
      console.error('Error occurred:', err);
    });
    // Return product details
    return res;
  }

  async _getSellerID(sellerId: string): Promise<number> {
    return parseInt(sellerId);
  }

  // Post Methods
  async createProduct(productData: ProductType, imageFiles: Express.Multer.File[]): Promise<Product | null> {
    try {
      productData.product_id = await this._genProductId(productData.user_id, productData.title);
      const productImageURLs = await this._uploadImageAWS(imageFiles);
      const newProduct = plainToClass(Product, { imageURLS: productImageURLs, ...productData });
      const user = await this.UserService.findById(productData.user_id);
      if (!user) {
        throw new Error('No user exists with this ID');
      }
      const product = await ProductRepository.createAndSave(newProduct, user);
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
      return false;
    } else {
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

  async bulkUploadProducts(products: ProductType[]): Promise<Product[]> {
    const newProducts: Product[] = await Promise.all(
      products.map(async (product) => {
        product.product_id = await this._genProductId(product.user_id, product.title);
        const convertedProduct = plainToInstance(Product, product);
        return convertedProduct;
      }),
    );
    const savedProducts = await ProductRepository.bulkCreate(newProducts);
    return savedProducts;
  }

  // Private Methods
  async _genProductId(sellerId: string, productName: string): Promise<string> {
    return await bcrypt.hashSync(sellerId + productName.toLowerCase(), 10);
  }

  async _uploadImageAWS(imageFiles: Express.Multer.File[]): Promise<string[]> {
    // Upload images to AWS S3
    const imageUrls = await Promise.all(
      imageFiles.map(async (image) => {
        const filename = `${Date.now()}-${image.originalname}`;
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Region: process.env.AWS_REGION,
          Key: filename,
          Body: image.buffer,
          ContentType: image.mimetype,
          ACL: 'public-read' as ObjectCannedACL,
        };
        try {
          await S3.send(new PutObjectCommand(params));
        } catch (error) {
          console.log(error);
          throw new Error('Failed to upload image');
        }
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        console.log(url);
        return url;
      }),
    );

    return imageUrls;
  }
}
