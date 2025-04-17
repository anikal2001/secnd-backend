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
import { SellerService } from './seller.service';
import { MarketplaceService } from './marketplace.service';
import { MeasurementService } from './measurement.service';
import { MarketplaceListing } from '../entity/marketplace.entity';
import { ProductImportRepository } from '../repositories/productImport.repository';
import { ProductInteraction } from '../entity/product_interactions.entity';
import { validate } from 'class-validator';
import { Gender, Material, ProductColors, ProductStatus, ProductSize, ProductCondition, ProductStyles } from '../utils/products.enums';
import { ProductClassifier } from '../services/ai.service';
import { productSizes } from '../utils/product/size';
export class ProductService {
  private UserService: UserService = new UserService();
  private ImageService: ImageService = new ImageService();
  private SellerService: SellerService = new SellerService();
  private MarketplaceService: MarketplaceService = new MarketplaceService();
  private MeasurementService: MeasurementService = new MeasurementService();
  private GeneratedResponseRepository = AppDataSource.getRepository(GeneratedResponse);
  private ProductInteractionRepository = AppDataSource.getRepository(ProductInteraction);
  private ProductClassifier: ProductClassifier = new ProductClassifier();
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
      const response = plainToClass(GeneratedResponse, {
        ...res,
        imageURL: imageURL,
        status: 'draft',
        user_id: sellerID,
        attributes: res?.attributes,
      });
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
      const mappedAttributes = {
        pattern: productData?.attributes?.pattern,
        waist_rise: productData?.attributes?.waist_rise,
        pants_length_type: productData?.attributes?.pants_length_type,
        dress_style: productData?.attributes?.dress_style,
        one_piece_style: productData?.attributes?.one_piece_style,
        skirt_style: productData?.attributes?.skirt_style,
        neckline: productData?.attributes?.neckline,
        sleeve_length_type: productData?.attributes?.sleeve_length_type,
        care_instructions: productData?.attributes?.care_instructions,
        activewear_style: productData?.attributes?.activewear_style,
        length_type: productData?.attributes?.length_type,
        age_group: productData?.attributes?.age_group,
        clothing_features: productData?.attributes?.clothing_features,
        fit: productData?.attributes?.fit,
        best_uses: productData?.attributes?.best_uses,
        outerwear_clothing_features: productData?.attributes?.outerwear_clothing_features,
        top_length_type: productData?.attributes?.top_length_type,
        dress_occasion: productData?.attributes?.dress_occasion,
        activewear_clothing_features: productData?.attributes?.activewear_clothing_features,
        skirt_dress_length_type: productData?.attributes?.skirt_dress_length,
      };

      console.log('Mapped attributes:', mappedAttributes);

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
      // Get existing product (include marketplaceListings for processing removals)
      const existingProduct = await ProductRepository.findOne({
        where: { product_id: productData.product_id },
        relations: ['imageURLS', 'seller', 'seller.user', 'marketplaceListings', 'measurements'],
      });

      if (!existingProduct) {
        console.log(`Product with ID ${productData.product_id} not found`);
        return null;
      }

      // Extract measurements from product data to handle separately
      const { measurements, ...productDataWithoutMeasurements } = productData;

      // Merge the existing product with the new data.
      Object.assign(existingProduct, productDataWithoutMeasurements);

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
      const mappedAttributes = {
        pattern: productData?.attributes?.pattern,
        waist_rise: productData?.attributes?.waist_rise,
        pants_length_type: productData?.attributes?.pants_length_type,
        dress_style: productData?.attributes?.dress_style,
        one_piece_style: productData?.attributes?.one_piece_style,
        skirt_style: productData?.attributes?.skirt_style,
        neckline: productData?.attributes?.neckline,
        sleeve_length_type: productData?.attributes?.sleeve_length_type,
        care_instructions: productData?.attributes?.care_instructions,
        activewear_style: productData?.attributes?.activewear_style,
        length_type: productData?.attributes?.length_type,
        age_group: productData?.attributes?.age_group,
        clothing_features: productData?.attributes?.clothing_features,
        fit: productData?.attributes?.fit,
        best_uses: productData?.attributes?.best_uses,
        outerwear_clothing_features: productData?.attributes?.outerwear_clothing_features,
        top_length_type: productData?.attributes?.top_length_type,
        dress_occasion: productData?.attributes?.dress_occasion,
        activewear_clothing_features: productData?.attributes?.activewear_clothing_features,
        skirt_dress_length_type: productData?.attributes?.skirt_dress_length_type,
      };

      // Save the updated product.
      const updatedProduct = await ProductRepository.save({ ...existingProduct, attributes: mappedAttributes });

      if (measurements && Array.isArray(measurements) && measurements.length > 0) {
        console.log('Updating measurements for product:', productData.product_id);
        // Since MeasurementService.updateMeasurementsForProduct deletes and recreates,
        // we just pass the measurements directly
        await this.MeasurementService.updateMeasurementsForProduct(updatedProduct.product_id, measurements);
      }

      // Re-fetch marketplace listings and attach them.
      const marketplaceListings = await this.MarketplaceService.findByProductId(updatedProduct.product_id);
      if (marketplaceListings.length > 0) {
        updatedProduct.marketplaceListings = marketplaceListings;
      }

      // Fetch the fully updated product with all relations
      const refreshedProduct = await ProductRepository.findOne({
        where: { product_id: updatedProduct.product_id },
        relations: ['imageURLS', 'seller', 'seller.user', 'marketplaceListings', 'measurements'],
      });

      return refreshedProduct || updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async saveImports(importData: any): Promise<any> {
    try {
      const validateImport = await validate(importData);
      if (validateImport.length > 0) {
        throw new Error('Validation failed');
      }
      console.log('Import data:', importData);
      const { user_id, marketplaceData, ...rest } = importData;
      if (marketplaceData) {
        const firstValue = Object.values(marketplaceData[0])[0] as { marketplace_id: string };
        const id = firstValue.marketplace_id;
        const key = Object.keys(marketplaceData[0])[0] as string;
        console.log('id', id, key);
        // Check if marketplaceID already exists
        const existingMarketplace = await this.MarketplaceService.findByMarketplaceId(id, key);
        if (existingMarketplace.length > 0) {
          throw new Error(`Marketplace with ID ${id} already exists`);
        }
      }
      const seller = await this.SellerService.getSellerById(user_id);
      if (!seller) {
        throw new Error(`Seller with user_id ${user_id} not found`);
      }
      importData.seller = seller;
      importData.image_urls = importData.pictureIds;

      importData.listed_size = importData.size;
      importData.shippingProfile = importData.shippingProfile;

      // Validate the import data
      const validatedImport = plainToClass(ProductImport, importData);
      const validationErrors = await validate(validatedImport);
      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        throw new Error('Validation failed');
      }
      const savedImports = await ProductImportRepository.createAndSave(validatedImport);

      // Convert the import data to a Product using our custom conversion function
      const convertedProduct = await this.convertImportToProduct(validatedImport);
      const completeProduct = await this.fillMissingFields(convertedProduct, false);

      // Validate the converted product
      const validatedProduct = await validate(completeProduct);
      if (validatedProduct.length > 0) {
        console.error('Product validation errors:', validatedProduct);
        throw new Error('Product validation failed: ' + JSON.stringify(validatedProduct));
      }

      // Save the converted product
      console.log('Saving product:', completeProduct);
      const savedProduct = await ProductRepository.createAndSave(completeProduct, user_id);

      if (savedProduct && importData.marketplaceData && Array.isArray(importData.marketplaceData)) {
        console.log('Marketplace data:', importData.marketplaceData);
        // Process marketplace listings and get marketplace names
        savedProduct.marketplaces = await this.MarketplaceService.processMarketplaces(savedProduct, importData.marketplaceData);

        // Save the product again with the updated marketplaces array
        await ProductRepository.save(savedProduct);
      }

      // Process image IDs
      const imageIds = await Promise.all(
        importData.pictureIds.map(async (image: any) => {
          return await this.ImageService.create({
            product_id: savedProduct?.product_id,
            url: typeof image === 'string' ? image : image.url,
          });
        }),
      );

      return savedImports;
    } catch (error) {
      console.error('Error saving imports:', error);
      throw error;
    }
  }

  async saveSoldImports(importData: any): Promise<any> {
    try {
      const validateImport = await validate(importData);
      if (validateImport.length > 0) {
        throw new Error('Validation failed');
      }
      const { user_id, marketplaceData, ...rest } = importData;
      if (marketplaceData) {
        const firstValue = Object.values(marketplaceData[0])[0] as { marketplace_id: string };
        const id = firstValue.marketplace_id;
        const key = Object.keys(marketplaceData[0])[0] as string;

        // Check if marketplaceID already exists
        const existingMarketplace = await this.MarketplaceService.findByMarketplaceId(id, key);
        if (existingMarketplace.length > 0) {
          throw new Error(`Marketplace with ID ${id} already exists`);
        }
      }
      const seller = await this.SellerService.getSellerById(user_id);
      if (!seller) {
        throw new Error(`Seller with user_id ${user_id} not found`);
      }
      importData.seller = seller;
      importData.image_urls = importData.pictureIds;
      importData.status = ProductStatus.sold;

      // Validate the import data
      const validatedImport = plainToClass(ProductImport, importData);
      const validationErrors = await validate(validatedImport);
      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        throw new Error('Validation failed');
      }
      const savedImports = await ProductImportRepository.createAndSave(validatedImport);

      // Convert the import data to a Product using our custom conversion function
      const convertedProduct = await this.convertImportToProduct(validatedImport);

      return savedImports;
    } catch (error) {
      console.error('Error saving imports:', error);
      throw error;
    }
  }

  async convertImportToProduct(importData: ProductImport): Promise<Product> {
    const convertedProduct = new Product();

    // Copy basic fields that don't need special conversion
    Object.keys(importData).forEach((key: string) => {
      if (
        typeof (importData as unknown as Record<string, unknown>)[key] !== 'undefined' &&
        !['gender', 'status', 'condition', 'material', 'listed_size', 'styles', 'color'].includes(key)
      ) {
        (convertedProduct as unknown as Record<string, unknown>)[key] = (importData as unknown as Record<string, unknown>)[key];
      }
    });

    // 1. Gender conversion
    if (importData.gender) {
      try {
        const genderMap: Record<string, Gender> = {
          male: Gender.Menswear,
          Male: Gender.Menswear,
          men: Gender.Menswear,
          Men: Gender.Menswear,
          mens: Gender.Menswear,
          Mens: Gender.Menswear,
          menswear: Gender.Menswear,
          Menswear: Gender.Menswear,

          female: Gender.Womenswear,
          Female: Gender.Womenswear,
          women: Gender.Womenswear,
          Women: Gender.Womenswear,
          womens: Gender.Womenswear,
          Womens: Gender.Womenswear,
          womenswear: Gender.Womenswear,
          Womenswear: Gender.Womenswear,
        };

        convertedProduct.gender = genderMap[importData.gender] || null;

        if (!convertedProduct.gender) {
          console.warn(`Gender value '${importData.gender}' not recognized, setting to default value`);
          convertedProduct.gender = Gender.Unisex;
        }
      } catch (error: any) {
        console.error(`Error converting gender: ${error.message}`);
        convertedProduct.gender = Gender.Unisex;
      }
    }

    // 2. Status conversion
    if (importData.status !== undefined) {
      try {
        // ProductStatus is numeric in your enum
        const statusValue: number = typeof importData.status === 'string' ? parseInt(importData.status, 10) : importData.status;

        if (Object.values(ProductStatus).includes(statusValue)) {
          convertedProduct.status = statusValue as ProductStatus;
        } else {
          console.warn(`Invalid status: ${importData.status}, defaulting to draft (0)`);
          convertedProduct.status = ProductStatus.draft;
        }
      } catch (error: any) {
        console.error(`Error converting status: ${error.message}`);
        convertedProduct.status = ProductStatus.draft;
      }
    } else {
      convertedProduct.status = ProductStatus.draft;
    }

    // 3. Condition conversion
    if (importData.condition) {
      try {
        const conditionMap: Record<string, ProductCondition> = {
          'new with tags': ProductCondition.NewWithTags,
          'New With Tags': ProductCondition.NewWithTags,
          new_with_tags: ProductCondition.NewWithTags,
          'like new': ProductCondition.LikeNew,
          'Like New': ProductCondition.LikeNew,
          like_new: ProductCondition.LikeNew,
          'used good': ProductCondition.UsedGood,
          'Used Good': ProductCondition.UsedGood,
          used_good: ProductCondition.UsedGood,
          'used fair': ProductCondition.UsedFair,
          'Used Fair': ProductCondition.UsedFair,
          used_fair: ProductCondition.UsedFair,
        };

        convertedProduct.condition = conditionMap[importData.condition] || null;

        if (!convertedProduct.condition) {
          console.warn(`Condition '${importData.condition}' not recognized, setting to null`);
        }
      } catch (error: any) {
        console.error(`Error converting condition: ${error.message}`);
        convertedProduct.condition = ProductCondition.NA;
      }
    }

    // 4. Material conversion
    if (importData.material) {
      try {
        // Try direct match first
        if (Object.values(Material).includes(importData.material as Material)) {
          convertedProduct.material = importData.material as Material;
        } else {
          // Try case-insensitive match
          const materialKey = Object.keys(Material).find(
            (key) => Material[key as keyof typeof Material].toLowerCase() === importData.material.toLowerCase(),
          );

          if (materialKey) {
            convertedProduct.material = Material[materialKey as keyof typeof Material];
          } else {
            console.warn(`Material '${importData.material}' not recognized, setting to null`);
            convertedProduct.material = Material.NA;
          }
        }
      } catch (error: any) {
        console.error(`Error converting material: ${error.message}`);
        convertedProduct.material = Material.NA;
      }
    }

    // 5. Listed Size conversion
    if (importData.listed_size) {
      try {
        // Try direct match first
        if (productSizes.includes(importData.listed_size)) {
          convertedProduct.listed_size = importData.listed_size;
        } else {
          // Try matching by abbreviation or full name (case-insensitive)
          const matchedSize = productSizes.find((size) => size.toLowerCase() === importData.listed_size.toLowerCase());

          if (matchedSize) {
            convertedProduct.listed_size = matchedSize;
          } else {
            console.warn(`Size '${importData.listed_size}' not recognized, setting to 'M'`);
            convertedProduct.listed_size = 'M'; // fallback to Medium if not recognized
          }
        }
      } catch (error: any) {
        console.error(`Error converting size: ${error.message}`);
        convertedProduct.listed_size = ProductSize.NA;
      }
    }

    // 6. Styles conversion (array of enums)
    if (importData.styles && Array.isArray(importData.styles)) {
      try {
        const validStyles: ProductStyles[] = [];

        for (const style of importData.styles) {
          if (typeof style === 'string') {
            // Try direct match first
            if (Object.values(ProductStyles).includes(style as ProductStyles)) {
              validStyles.push(style as ProductStyles);
              continue;
            }

            // Try case-insensitive match
            const styleKey = Object.keys(ProductStyles).find(
              (key) => ProductStyles[key as keyof typeof ProductStyles].toLowerCase() === style.toLowerCase(),
            );

            if (styleKey) {
              validStyles.push(ProductStyles[styleKey as keyof typeof ProductStyles]);
            } else {
              console.warn(`Style '${style}' not recognized, skipping`);
            }
          }
        }

        convertedProduct.styles = validStyles;
      } catch (error: any) {
        console.error(`Error converting styles: ${error.message}`);
        convertedProduct.styles = [];
      }
    } else {
      convertedProduct.styles = [];
    }

    // 8. Colors conversion (complex object)
    convertedProduct.color = {
      primaryColor: [],
      secondaryColor: [],
    };

    if (importData.color && importData.color.primaryColor) {
      try {
        const validPrimaryColors: ProductColors[] = [];

        for (const color of importData.color.primaryColor) {
          if (typeof color === 'string') {
            // Try direct match first
            if (Object.values(ProductColors).includes(color as ProductColors)) {
              validPrimaryColors.push(color as ProductColors);
              continue;
            }

            // Try case-insensitive match
            const colorKey = Object.keys(ProductColors).find(
              (key) => ProductColors[key as keyof typeof ProductColors].toLowerCase() === color.toLowerCase(),
            );

            if (colorKey) {
              validPrimaryColors.push(ProductColors[colorKey as keyof typeof ProductColors]);
            } else {
              console.warn(`Primary color '${color}' not recognized, skipping`);
            }
          }
        }

        convertedProduct.color.primaryColor = validPrimaryColors;
      } catch (error: any) {
        console.error(`Error converting primary colors: ${error.message}`);
      }
    }

    if (importData.color && importData.color.secondaryColor) {
      try {
        const validSecondaryColors: ProductColors[] = [];

        for (const color of importData.color.secondaryColor) {
          if (typeof color === 'string') {
            // Try direct match first
            if (Object.values(ProductColors).includes(color as ProductColors)) {
              validSecondaryColors.push(color as ProductColors);
              continue;
            }

            // Try case-insensitive match
            const colorKey = Object.keys(ProductColors).find(
              (key) => ProductColors[key as keyof typeof ProductColors].toLowerCase() === color.toLowerCase(),
            );

            if (colorKey) {
              validSecondaryColors.push(ProductColors[colorKey as keyof typeof ProductColors]);
            } else {
              console.warn(`Secondary color '${color}' not recognized, skipping`);
            }
          }
        }

        convertedProduct.color.secondaryColor = validSecondaryColors;
      } catch (error: any) {
        console.error(`Error converting secondary colors: ${error.message}`);
      }
    }

    // 9. Copy attributes
    if (importData.attributes) {
      convertedProduct.attributes = importData.attributes;
    }

    // 10. Set the seller
    if (importData.seller) {
      convertedProduct.seller = importData.seller;
    }

    return convertedProduct;
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

  // INFERENCE
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
        skirt_dress_length_type: enhancedResponse?.attributes?.skirt_dress_length,
      };

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

  async fillMissingFields(product: Partial<Product>, save: boolean): Promise<Product> {
    // Check if the product has an images property or relation
    let imageUrls: string[] = [];

    // Handle case where images might be in imageURLS relation
    if ((product as any).imageURLS && Array.isArray((product as any).imageURLS)) {
      imageUrls = (product as any).imageURLS.map((img: any) => img.url);
    }
    // Handle case where images might be directly on the product
    else if ((product as any).images && Array.isArray((product as any).images)) {
      imageUrls = (product as any).images.map((img: any) => img.url);
    }

    const enrichedProduct = await this.ProductClassifier.inferMissingProductDetails(imageUrls, product);
    const enhancedResponse = enrichedProduct ? enhanceProductWithBrandMatch(enrichedProduct, true) : enrichedProduct;
    // Merge the enriched product with the original product
    const mergedProduct = {
      ...product,
      ...enhancedResponse,
      // Ensure tags is an array
      tags: Array.isArray(enhancedResponse.tags) ? enhancedResponse.tags : [],
      listed_size: enrichedProduct.size,
      color: enrichedProduct.color,
      primaryColor: enrichedProduct.color.primaryColor,
      secondaryColor: enrichedProduct.color.secondaryColor,
    };

    // Special handling for attributes
    if (enhancedResponse.attributes && !product.attributes) {
      mergedProduct.attributes = enhancedResponse.attributes;
    } else if (enhancedResponse.attributes && product.attributes) {
      mergedProduct.attributes = {
        ...enhancedResponse.attributes,
        ...product.attributes,
      };
    }

    // Create a complete product object
    const completeProduct = new Product();
    Object.assign(completeProduct, mergedProduct);

    // if save, save to database
    if (save) {
      // Use the global ProductRepository instead of this.productRepository
      await ProductRepository.save(completeProduct);
    }

    return completeProduct;
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

  async addProductInteraction(interactions: any): Promise<any> {
    try {
      const savedInteractions = await Promise.all(
        interactions.map(async (interaction: any) => {
          // Validate the marketplace id exists in the product table
          const marketplaceListing = await this.MarketplaceService.findByMarketplaceId(interaction.marketplace_id);
          if (!marketplaceListing) {
            throw new Error(`Marketplace with ID ${interaction.marketplace_id} not found`);
          }

          // Get the product associated to marketplace id
          const product = await ProductRepository.findOneBy({ product_id: marketplaceListing[0].product.product_id });
          if (!product) {
            throw new Error(`Product with ID ${marketplaceListing[0].product.product_id} not found`);
          }

          const newInteraction = plainToClass(ProductInteraction, { ...interaction, product: product });
          const validationErrors = await validate(newInteraction);
          if (validationErrors.length > 0) {
            console.error('Validation errors:', validationErrors);
            throw new Error('Validation failed');
          }
          const savedInteraction = await this.ProductInteractionRepository.save(newInteraction);
          return savedInteraction;
        }),
      );

      return savedInteractions;
    } catch (error) {
      console.error('Error adding product interaction:', error);
      throw error;
    }
  }

  async getOtherMarketplaceListings(
    marketplaceId: string,
    soldMarketplace: string,
  ): Promise<{ product_id: string; otherListings: MarketplaceListing[] }> {
    const { product_id, otherListings } = await this.MarketplaceService.getOtherMarketplaceListings(marketplaceId, soldMarketplace);
    return { product_id, otherListings };
  }
}
