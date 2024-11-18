import bcrypt from 'bcrypt';
import { PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import S3 from '../utils/AWSClient';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product, GeneratedResponse } from '../entity/product.entity';
import { ProductFilters, ProductType } from '../types/product';
import { ProductCategory, ProductStatus } from '../utils/products.enums';
import { ProductRepository } from '../repositories/product.repository';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { UserService } from './user.service';
import { main } from '../utils/OpenAPI';
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
    const product = await ProductRepository.findOne({
      where: { product_id: id },
      relations: ['imageURLS'], // Include the 'imageURLS' relation
    });
    if (!product) {
      return null;
    }
    return plainToInstance(Product, product);
  }

  async generateProductDetails(sellerID: string, imageFiles: Express.Multer.File[]): Promise<any> {
    try {
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
      const product = plainToClass(Product, { status: 'draft', seller: sellerID, ...updatedImageURLS });
      const savedProduct = await ProductRepository.createAndSave(product, sellerID);
      // Save the image URLs to the Image Database
      if (savedProduct) {
        await this.saveImagesToDB(product.product_id,imageUrls);
      }
      // Save the response to the GeneratedResponse Database
      const response = plainToClass(GeneratedResponse, savedProduct);
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

  async saveImagesToDB(productID: string, imageUrls: string[]): Promise<string[]> {
    const imageIDs: string[] = []
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
      const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
      
      // // Get a public URL instead of a signed URL
      // const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

      // Save to database
      const savedImage = await this.ImageService.create({ 
        product_id: null,
        url: url 
      });

      return {
        image_id: savedImage.image_id,
        url: url
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error('Failed to upload image');
    }
  }

  async _getSellerID(sellerId: string): Promise<number> {
    return parseInt(sellerId);
  }

  // Post Methods

  async createProduct(productData: any): Promise<Product | null> {
    try {
      // Parse seller data if it's a string
      if (typeof productData.seller === 'string') {
        productData.seller = JSON.parse(productData.seller);
      }

      // Parse brand if it's a string
      if (typeof productData.brand === 'string') {
        try {
          productData.brand = JSON.parse(productData.brand);
        } catch (e) {
          console.log('Brand parsing failed, keeping original value');
        }
      }

      // Get the image URLs from the provided pictureIds
      const images = await Promise.all(
        productData.pictureIds.map((id: string) => this.ImageService.findOne(id))
      );

      // Filter out any null values and get URLs
      const imageURLS = images
        .filter((img): img is { url: string } => img !== null)
        .map(img => img.url);

      // Add active status
      productData.status = ProductStatus.active;

      // Create the product with image URLs
      const { pictureIds, ...restProductData } = productData;
      const newProduct = plainToClass(Product, {
        ...restProductData,
        imageURLS
      });

      // Save the product
      const product = await ProductRepository.createAndSave(newProduct, productData.seller.user_id);

      if (product) {
        await Promise.all(
          pictureIds.map((id: string, index: number) => 
            this.ImageService.update(id, {
              product_id: product.product_id,
              image_type: index <= 2 ? index : 3,
              product: product
            })
          )
        );
      }

      return product;
    } catch (error) {
      console.error("Create product error:", error);
      return null;
    }
  }

  async updateProduct(id: string, productData: Product): Promise<boolean> {
    const validFields = ['title', 'description', 'price', 'product_category', 'tags', 'brand', 'color', 'size', 'styles', 'condition', 'material'];
    const validUpdates = Object.keys(productData).every((field) => validFields.includes(field));

    if (!validUpdates) {
      console.error('Invalid fields');
      throw new Error('Invalid fields');
    }

    console.log(validUpdates);

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
}
