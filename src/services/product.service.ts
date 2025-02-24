import { PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import S3 from '../utils/AWSClient';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product, GeneratedResponse } from '../entity/product.entity';
import { ProductFilters, ProductType } from '../types/product';
import { Category } from '../utils/product/category';
import { ProductRepository } from '../repositories/product.repository';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { UserService } from './user.service';
import { main } from './ai.service';
import { AppDataSource } from '../database/config';
import { ImageService } from './image.service';
import { ImageData } from '../types/image';

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
    if (!(category in Category.getAllTopLevelCategories())) {
      throw new Error('Invalid category');
    }
    const products = await ProductRepository.findBy({ category });
    if (!products) {
      return [];
    }
    return plainToInstance(Product, products);
  }

  async getProductsBySubCategory(subcategory: string): Promise<Product[]> {
    if (!(subcategory in Category.getAllSubcategories())) {
      throw new Error('Invalid category');
    }
    const products = await ProductRepository.findBy({ subcategory });
    if (!products) {
      return [];
    }
    return plainToInstance(Product, products);
  }

  async filterProducts(filter: ProductFilters): Promise<Product[]> {
    const products = await ProductRepository.filterProducts(filter);
    if (!products) {
      return [];
    }
    return products;
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await ProductRepository.findOne({
      where: { product_id: id },
      relations: ['imageURLS'], // Include the 'imageURLS' relation
    });
    if (!product) {
      return null;
    }
    return plainToInstance(Product, product);
  }

  async generateProductDetails(sellerID: string, imageURL: string[]): Promise<any> {
    try {
      // Call ChatGPT API to generate product details
      const res = await main(imageURL).catch((err) => {
        console.error('Error occurred:', err);
      });

      const seller = await this.UserService.findById(sellerID);

      if (!seller) {
        throw new Error('Seller not found');
      }

      // Save the response to the GeneratedResponse Database
      console.log(res);
      const response = plainToClass(GeneratedResponse, { ...res, imageURL: imageURL, status: 'draft', seller: { user_id: sellerID } });
      console.log(response);
      const savedResponse = await this.GeneratedResponseRepository.save(response);
      return savedResponse;
    } catch (error) {
      console.log(error);
      return null;
    }
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
          const url = 'https://dq534dzir8764.cloudfront.net/'+ filename; 
          // const url = await getSignedUrl(S3, command, { expiresIn: 60 * 60 * 24 * 7 });
          return url;
        } catch (error) {
          console.log(error);
          throw new Error('Failed to upload image');
        }
      }),
    );

    return imageUrls;
  }

  async saveImagesToDB(productID: string, imageUrls: string[]): Promise<string[]> {
    const imageIDs: string[] = [];
    try {
      imageUrls.forEach(async (url) => {
        const imageID = await this.ImageService.create({ product_id: productID, url: url });
        imageIDs.push(imageID.image_id);
      });
    } catch (error) {
      console.log(error);
    }
    return imageIDs;
  }

  async _uploadAndSaveImage(image: Express.Multer.File): Promise<{ image_id: string; url: string }> {
    try {
      // Create a unique filename with original extension
      const fileExt = image.originalname.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Set proper content type based on file mimetype
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Region: process.env.AWS_REGION,
        Key: filename,
        Body: image.buffer,
        ContentType: image.mimetype,
        ACL: 'public-read' as ObjectCannedACL,
      };

      // Upload to S3
      await S3.send(new PutObjectCommand(params));
      const command = new GetObjectCommand(params);
      const url = 'https://dq534dzir8764.cloudfront.net/'+ filename;
      // const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
      
      // // Get a public URL instead of a signed URL
      // const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

      // Save to database
      const savedImage = await this.ImageService.create({
        product_id: null,
        url: url,
      });

      return {
        image_id: savedImage.image_id,
        url: url,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  async _getSellerID(sellerId: string): Promise<number> {
    return parseInt(sellerId);
  }

  // Post Methods

  async createProduct(productData: any): Promise<Product | null> {
    try {
      // Parse brand if it's a string
      if (typeof productData.brand === 'string') {
        try {
          productData.brand = JSON.parse(productData.brand);
        } catch (e) {
          console.log('Brand parsing failed, keeping original value');
        }
      }

      // Get the image URLs from the provided pictureIds
      const images = await Promise.all(productData.pictureIds.map((id: string) => this.ImageService.findOne(id)));

      // Filter out any null values and get URLs
      const imageURLS = images.filter((img): img is { url: string } => img !== null).map((img) => img.url);

      // Create the product with image URLs
      const { pictureIds, ...restProductData } = productData;
      const newProduct = plainToClass(Product, {
        ...restProductData,
        imageURLS,
      });

      // Save the product
      const product = await ProductRepository.createAndSave(newProduct, productData.user_id);

      if (product) {
        await Promise.all(
          pictureIds.map((id: string, index: number) =>
            this.ImageService.update(id, {
              product_id: product.product_id,
              image_type: index <= 2 ? index : 3,
              product: product,
            }),
          ),
        );
      }

      return product;
    } catch (error) {
      console.error('Create product error:', error);
      return null;
    }
  }

  async updateProduct(id: string, productData: Product): Promise<boolean> {
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
        const convertedProduct = plainToInstance(Product, product);
        return convertedProduct;
      }),
    );
    const savedProducts = await ProductRepository.bulkCreate(newProducts);
    return savedProducts;
  }

  async inferenceImages(images: ImageData[]) {
    try {
      const imageURLs = images.map((img) => img.url);

      // Call ChatGPT API to generate product details
      const res = await main(imageURLs).catch((err) => {
        console.error('Error occurred:', err);
      });

      const response = plainToClass(GeneratedResponse, {
        ...res,
        images: images,
        status: 'draft',
      });
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
