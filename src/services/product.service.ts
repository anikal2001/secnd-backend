import bcrypt from 'bcrypt';
import { PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import S3 from '../utils/AWSClient';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product, GeneratedResponse } from '../entity/product.entity';
import { ProductFilters, ProductType } from '../types/product';
import { ProductCategory, ProductTags } from '../utils/products.enums';
import { ProductRepository } from '../repositories/product.repository';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { UserService } from './user.service';
import { main } from '../utils/OpenAPI';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../database/config';
import { ImageService } from './image.service';
import { User } from '../entity/user.entity';

export class ProductService {
  private UserService: UserService = new UserService();
  private ImageService: ImageService = new ImageService();
  private GeneratedResponseRepository = AppDataSource.getRepository(GeneratedResponse);
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


  async generateProductDetails(sellerID: string, imageFiles: Express.Multer.File[]): Promise<any> {
    try {
      // Generate a product ID
      const productId = uuidv4();
      // Upload images to AWS S3
      const imageUrls = await this._uploadImageAWS(imageFiles);
      if (imageUrls.length === 0) {
        console.error('No images uploaded');
        return null;
      }
      
      // Call ChatGPT API to generate product details
      const res = await main(imageUrls[0]).catch((err) => {
        console.error('Error occurred:', err);
      });
      // Convert res to JSON
      const cleanResponse = res.replace(/```json|```/g, '').trim();
      const parsedResponse = JSON.parse(cleanResponse);
      const updatedImageURLS = { ...parsedResponse, imageURLS: imageUrls };
      // Save the response to the Product Database
      const product = plainToClass(Product, { product_id: productId, status: 'draft', seller: sellerID, ...updatedImageURLS });
      const savedProduct = await ProductRepository.createAndSave(product, sellerID);
      // Save the image URLs to the Image Database
      if (savedProduct) {
        await this.saveImagesToDB(productId, imageUrls);
      }
      // Save the response to the GeneratedResponse Database
      const response = plainToClass(GeneratedResponse,  savedProduct);
      const savedResponse = await this.GeneratedResponseRepository.save(response);
      return savedResponse;
    } catch (error) {
      console.log(error);
      return null;
    }
  }


  async saveImagesToDB(productID: string, imageUrls: string[]): Promise<boolean> {
    try {
          imageUrls.forEach(async (url) => {
      await this.ImageService.create({ product_id: productID, url: url });
    });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  async _getSellerID(sellerId: string): Promise<number> {
    return parseInt(sellerId);
  }

  // Post Methods

    async createProduct(productData: Product, imageFiles: Express.Multer.File[]): Promise<Product | null> {
    try {
      productData.product_id = uuidv4();
      const productImageURLs = await this._uploadImageAWS(imageFiles);
      const newProduct = plainToClass(Product, { imageURLS: productImageURLs, ...productData });
      const product = await ProductRepository.createAndSave(newProduct, productData.seller.user_id);
      return product;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateProduct(id: string, productData: Product): Promise<boolean> {
    console.log(productData)
    const validFields = ['title', 'description', 'price', 'quantity', 'product_category', 'tags', 'brand', 'color', 'size', 'styles', 'condition', 'material'];
    const validUpdates = Object.keys(productData).every((field) => validFields.includes(field));
    if (!validUpdates) {
      console.error('Invalid fields');
      return false;
    }

    console.log(validUpdates)


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
        product.product_id = uuidv4();
        const convertedProduct = plainToInstance(Product, product);
        return convertedProduct;
      }),
    );
    const savedProducts = await ProductRepository.bulkCreate(newProducts);
    return savedProducts;
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
          const command = new GetObjectCommand(params);
          const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
          return url;
        } catch (error) {
          console.log(error);
          throw new Error('Failed to upload image');
        }
      }),
    );

    return imageUrls;
  }
}
