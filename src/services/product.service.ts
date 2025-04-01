import { PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import S3 from '../utils/AWSClient';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Product, GeneratedResponse, ProductImport } from '../entity/product.entity';
import { ProductFilters, ProductType } from '../types/product';
import { Category } from '../utils/product/category';
import { ProductRepository } from '../repositories/product.repository';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { UserService } from './user.service';
import { main } from './ai.service';
import { enhanceProductWithBrandMatch } from '../utils/product/brandMatcher';
import { AppDataSource } from '../database/config';
import { ImageService } from './image.service';
import { ImageData } from '../types/image';
import { ProductStatus } from '../utils/products.enums';
import { SellerService } from './seller.service';
import { MarketplaceService } from './marketplace.service';
import { MeasurementService } from './measurement.service';
import { MarketplaceListing } from '../entity/marketplace.entity';

export class ProductService {
  private UserService: UserService = new UserService();
  private ImageService: ImageService = new ImageService();
  private SellerService: SellerService = new SellerService();
  private MarketplaceService: MarketplaceService = new MarketplaceService();
  private MeasurementService: MeasurementService = new MeasurementService();
  private GeneratedResponseRepository = AppDataSource.getRepository(GeneratedResponse);
  private ProductImportRepository = AppDataSource.getRepository(ProductImport);
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
      relations: ['imageURLS', 'seller', 'seller.user', 'marketplaceListings', 'measurements'],
    });

    if (product) {
      // Get marketplace listings for this product
      const marketplaceListings = await this.MarketplaceService.findByProductId(product.product_id);

      // Attach marketplace listings to the product for the client
      if (marketplaceListings.length > 0) {
        product.marketplaceListings = marketplaceListings;
      }
    }

    return product;
  }

  async generateProductDetails(sellerID: string, imageURL: string[], titleTemplate: string): Promise<any> {
    try {
      // Call ChatGPT API to generate product details
      const res = await main(imageURL, titleTemplate).catch((err) => {
        console.error('Error occurred:', err);
      });

      const seller = await this.UserService.findById(sellerID);

      if (!seller) {
        throw new Error('Seller not found');
      }

      // Save the response to the GeneratedResponse Database
      const response = plainToClass(GeneratedResponse, { ...res, imageURL: imageURL, status: 'draft', user_id: sellerID, attributes: res?.attributes });
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
          const url = 'https://dq534dzir8764.cloudfront.net/' + filename;
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
      const url = 'https://dq534dzir8764.cloudfront.net/' + filename;
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
      console.log('Creating product:', productData);

      // Validate required pictureIds
      if (!productData.pictureIds || !Array.isArray(productData.pictureIds)) {
        throw new Error('Picture IDs are required and must be an array');
      }

      // Create a new product instance
      const product = new Product();

      // Set basic product information - exclude pictureIds to handle separately
      const { pictureIds, measurements, ...restProductData } = productData;
      Object.assign(product, restProductData);

      // Set status to active if not provided
      if (productData.status === undefined) {
        product.status = ProductStatus.active;
      }

      // Set listed_size to null if empty string
      if (productData.listed_size === '') {
        product.listed_size = productData.listed_size === '' ? null : productData.listed_size;
      }

      // Set the seller relationship
      if (productData.user_id) {
        // Find the seller by user_id
        const seller = await this.SellerService.getSellerById(productData.user_id);
        if (!seller) {
          throw new Error(`Seller with user_id ${productData.user_id} not found`);
        }
        product.seller = seller;
      } else {
        throw new Error('user_id is required to create a product');
      }

      // Save the product first to get an ID (without trying to handle relationships yet)
      const savedProduct = await ProductRepository.save(product);

      // Now handle image associations after product is saved
      if (savedProduct && pictureIds && Array.isArray(pictureIds)) {
        for (let i = 0; i < pictureIds.length; i++) {
          const imageId = pictureIds[i];
          await this.ImageService.update(imageId, {
            product_id: savedProduct.product_id,
            image_type: i <= 2 ? i : 3,
          });
        }
      }

      // Process marketplace data if provided
      if (productData.marketplaceData && Array.isArray(productData.marketplaceData)) {
        // Process marketplace listings and get marketplace names
        savedProduct.marketplaces = await this.MarketplaceService.processMarketplaces(savedProduct, productData.marketplaceData);

        // Save the product again with the updated marketplaces array
        await ProductRepository.save(savedProduct);
      }

      // Process measurements if provided
      if (measurements) {
        await this.MeasurementService.createMeasurementsForProduct(savedProduct.product_id, measurements);
      }

      // Get the complete product with all relations
      const completeProduct = await ProductRepository.findOne({
        where: { product_id: savedProduct.product_id },
        relations: ['imageURLS', 'seller', 'seller.user', 'measurements'],
      });

      if (completeProduct) {
        // Get marketplace listings for this product
        const marketplaceListings = await this.MarketplaceService.findByProductId(savedProduct.product_id);

        // Attach marketplace listings to the product for the client
        if (marketplaceListings.length > 0) {
          completeProduct.marketplaceListings = marketplaceListings;
        }
      }

      return completeProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }



  async updateProduct(id: string, productData: Product): Promise<Product | null> {
    try {
      console.log('Updating product with ID:', id, 'Data:', productData);

      // Get existing product (include marketplaceListings for processing removals)
      const existingProduct = await ProductRepository.findOne({
        where: { product_id: id },
        relations: ['imageURLS', 'seller', 'seller.user', 'marketplaceListings', 'measurements'],
      });

      if (!existingProduct) {
        console.log(`Product with ID ${id} not found`);
        return null;
      }

      // Merge the existing product with the new data.
      Object.assign(existingProduct, productData);

      // Set status to active if not provided.
      if (productData.status === undefined) {
        existingProduct.status = ProductStatus.active;
      }

      // If marketplaces array is provided, remove delisted marketplaces.
      if (productData.marketplaces) {
        const updatedMarketplaces: string[] = productData.marketplaces;
        if (existingProduct.marketplaceListings && existingProduct.marketplaceListings.length > 0) {
          // Identify listings that should be removed.
          const listingsToRemove = existingProduct.marketplaceListings.filter((listing) => !updatedMarketplaces.includes(listing.marketplace));
          if (listingsToRemove.length > 0) {
            // Remove each listing using the MarketplaceService.
            await Promise.all(listingsToRemove.map((listing) => this.MarketplaceService.deleteListing(listing.id.toString())));
            // Remove these listings from the in-memory list.
            existingProduct.marketplaceListings = existingProduct.marketplaceListings.filter((listing) =>
              updatedMarketplaces.includes(listing.marketplace),
            );
          }
        }
      }

      // Save the updated product.
      const updatedProduct = await ProductRepository.save(existingProduct);

      if (productData.measurements) {
        await this.MeasurementService.updateMeasurementsForProduct(updatedProduct.product_id, productData.measurements);
      }

      // Re-fetch marketplace listings and attach them.
      const marketplaceListings = await this.MarketplaceService.findByProductId(updatedProduct.product_id);
      if (marketplaceListings.length > 0) {
        updatedProduct.marketplaceListings = marketplaceListings;
      }

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async saveImports(imports: ProductImport[]): Promise<ProductImport[]> {
    try {
      const savedImports = await this.ProductImportRepository.save(imports);
      return savedImports;
    } catch (error) {
      console.error('Error saving imports:', error);
      throw error;
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

  async deleteMultipleProducts(ids: string[]): Promise<boolean[]> {
    try {
      await ProductRepository.delete(ids);
      return ids.map(() => true);
    } catch (error) {
      console.error('Error deleting products:', error);
      return ids.map(() => false);
    }
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

  async inferenceImages(
    images: ImageData[],
    titleTemplate?: string,
    descriptionTemplate?: string,
    sellerID?: string,
    exampleDescription?: string,
    tags?: string[],
  ) {
    try {
      const imageURLs = images.map((img) => img.url);

      const res = await main(imageURLs, titleTemplate, descriptionTemplate, exampleDescription, tags).catch((err) => {
        console.error('Error occurred:', err);
      });

      const enhancedResponse = res ? enhanceProductWithBrandMatch(res) : res;

      let seller = null;
      if (sellerID) {
        seller = await this.SellerService.getSellerById(sellerID);

        if (!seller) {
          throw new Error(`Seller with user_id ${sellerID} not found`);
        }
      }

      const mappedAttributes = {
        pattern: enhancedResponse?.attributes?.pattern,
        waist_rise: enhancedResponse?.attributes?.waist_rise,
        pants_length_type: enhancedResponse?.attributes?.pants_length_type,
        dress_style: enhancedResponse?.attributes?.dress_style,
        one_piece_style: enhancedResponse?.attributes?.one_piece_style,
        skirt_style: enhancedResponse?.attributes?.skirt_style,
        neckline: enhancedResponse?.attributes?.neckline,
        sleeve_length_type: enhancedResponse?.attributes?.sleeve_length_type,
        care_instructions: enhancedResponse?.attributes?.care_instructions,
        activewear_style: enhancedResponse?.attributes?.activewear_style,
        length_type: enhancedResponse?.attributes?.length_type,
        age_group: enhancedResponse?.attributes?.age_group,
        clothing_features: enhancedResponse?.attributes?.clothing_features,
        fit: enhancedResponse?.attributes?.fit,
        best_uses: enhancedResponse?.attributes?.best_uses,
        outerwear_clothing_features: enhancedResponse?.attributes?.outerwear_clothing_features,
        top_length_type: enhancedResponse?.attributes?.top_length_type,
        dress_occasion: enhancedResponse?.attributes?.dress_occasion,
        activewear_clothing_features: enhancedResponse?.attributes?.activewear_clothing_features,
      }

      console.log('Mapped attributes:', mappedAttributes);

      const response = plainToClass(GeneratedResponse, {
        ...enhancedResponse,
        images: images,
        status: 'draft',
        seller: seller,
        attributes: mappedAttributes,
      });
      await this.GeneratedResponseRepository.save(response);
      return response;
    } catch (error) {
      console.error('Error during inference:', error);
      return null;
    }
  }

  // Marketplace related
  async delistMarketplaceListing(product_id: string, marketplace: string): Promise<void> {
    try {
      if (marketplace === 'etsy') {
        await this.MarketplaceService.updateListingStatus(product_id, marketplace, 'inactive');
      } else {
        await this.MarketplaceService.deleteListingByProductAndMarketplace(product_id, marketplace);
      }

      // Now, check if there are any active listings left for this product.
      const exists = await this.MarketplaceService.doesAnyListingExist(product_id);

      // If no active marketplace listing remains, update the product status.
      if (!exists) {
        const status = marketplace === 'etsy' ? ProductStatus.deactivated : ProductStatus.draft;
        await ProductRepository.update(product_id, { status });
      }
    } catch (error) {
      console.error('Error deleting marketplace listing:', error);
      throw error;
    }
  }

  async deleteMarketplaceListing(product_id: string, marketplace: string): Promise<void> {
    try {
      await this.MarketplaceService.deleteListingByProductAndMarketplace(product_id, marketplace);
    } catch (error) {
      console.error('Error removing marketplace listing:', error);
      throw error;
    }
  }

  async getOtherMarketplaceListings(marketplaceId: string, soldMarketplace: string): Promise<{ product_id: string; otherListings: MarketplaceListing[] }> {
    const { product_id, otherListings } = await this.MarketplaceService.getOtherMarketplaceListings(marketplaceId, soldMarketplace);
    return { product_id, otherListings };
  }
}
