import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import { ProductService } from '../services/product.service';
import { ProductStatus } from '../utils/products.enums';
import { MeasurementService } from '../services/measurement.service';
import { randomUUID } from 'crypto';

export class ProductController {
  static productService: ProductService = new ProductService();

  private upload: multer.Multer; // Multer instance

  constructor() {
    const storage = multer.memoryStorage();
    this.upload = multer({ dest: 'uploads/', storage: storage });
  }

  public genProductInfo = async (req: Request, res: Response): Promise<void> => {
    // Use multer to parse the form data
    this.upload.any()(req, res, async (err) => {
      if (err) {
        // Send error response if multer encounters an issue
        return res.status(400).json({ message: 'Error parsing form data', error: err.message });
      }

      try {
        // Ensure request body is present
        if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({ message: 'Request body is required' });
        }

        const imageURL = req.body.image;
        const sellerID = req.body.sellerID;

        const productDetails = await ProductController.productService.generateProductDetails(sellerID, imageURL, req.body.titleTemplate);

        // Send success response
        return res.status(200).json(productDetails);
      } catch (error: any) {
        // Catch and handle errors during processing
        return res.status(500).json({ message: error.message });
      }
    });
  };

  public addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure request body is present
      if (!req.body) {
        res.status(400).json({ message: 'Request body is required' });
        return;
      }

      // Validate required fields
      if (!req.body.pictureIds || !Array.isArray(req.body.pictureIds) || req.body.pictureIds.length === 0) {
        res.status(400).json({ message: 'At least one picture ID is required' });
        return;
      }

      if (!req.body.user_id) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      if (!req.body.title) {
        res.status(400).json({ message: 'Product title is required' });
        return;
      }

      if (!req.body.price || isNaN(parseFloat(req.body.price))) {
        res.status(400).json({ message: 'Valid product price is required' });
        return;
      }

      // Status is now handled in the service layer
      // We only need to set it if explicitly requested by publish flag
      if (req.body.publish === true) {
        req.body.status = ProductStatus.active;
      }

      const product = await ProductController.productService.createProduct(req.body);

      if (!product) {
        res.status(400).json({ message: 'Failed to create product' });
        return;
      }

      // Return appropriate status code - 201 for new products, 200 for updates
      const statusCode = req.body.product_id ? 200 : 201;
      res.status(statusCode).json(product);
    } catch (error: any) {
      console.error('Add product error:', error);
      // Provide more specific error messages based on error type
      if (error.message.includes('Seller not found')) {
        res.status(404).json({ message: 'Seller not found. User may not be registered as a seller.' });
      } else if (error.message.includes('Unauthorized')) {
        res.status(403).json({ message: 'You are not authorized to modify this product' });
      } else if (error.message.includes('Product not found')) {
        res.status(404).json({ message: 'Product not found' });
      } else if (error.message.includes('No valid images found')) {
        res.status(400).json({ message: 'No valid images found. Please upload images first.' });
      } else {
        res.status(400).json({ message: error.message || 'An error occurred while processing your request' });
      }
    }
  };

  public addProductInteraction = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure request body is present
      if (!req.body) {
        res.status(400).json({ message: 'Request body is required' });
        return;
      }
      if (req.body.length === 0) {
        res.status(400).json({ message: 'Request body cannot be empty' });
        return;
      }

      const interaction = await ProductController.productService.addProductInteraction(req.body);

      if (!interaction) {
        res.status(400).json({ message: 'Failed to create product interaction' });
        return;
      }

      res.status(201).json(interaction);
    } catch (error: any) {
      console.error('Add product interaction error:', error);
    }
  };

  public _handleFileUpload = (fieldName: string, maxCount: number = 10) => {
    return this.upload.array(fieldName, maxCount);
  };

  public _handleFileUploadErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error('Error during file upload:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    next();
  };

  public uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
      this.upload.single('image')(req, res, async (err) => {
        if (err) {
          console.error('Error during file upload:', err);
          res.status(400).json({ message: err.message });
          return;
        }

        // Access uploaded file
        const file = req.file;
        if (!file) {
          res.status(400).json({ message: 'Image is required' });
          return;
        }

        try {
          const response = await ProductController.productService._uploadAndSaveImage(file);
          res.status(200).json(response);
        } catch (error: any) {
          console.error('Error saving image:', error);
          res.status(500).json({ message: error.message });
        }
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(400).json({ message: error.message });
    }
  };

  async fetchProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductController.productService.fetchProducts();
      if (!products) {
        res.status(404).json({ message: 'No products found' });
        return;
      }
      const formattedProducts = products.map((product) => {
        return {
          ...product,
          seller: product.seller.store_name,
          key_design_element: product.descriptive_sentence,
          imageURLS: product.imageURLS.map((image) => image.url),
        };
      })
        
      res.status(200).json(formattedProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = req.query.id as string;
      const product = await ProductController.productService.getProductById(productId);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.body.product_id?.toString();
      console.log('This is the id', id);
      if (!id) {
        res.status(400).json({ message: 'Product ID is required' });
        return;
      }

      // Get existing product to maintain status if not explicitly changed
      const existingProduct = await ProductController.productService.getProductById(id);
      if (!existingProduct) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      // Keep existing status unless explicitly changed
      if (!req.body.status) {
        req.body.status = existingProduct.status;
      }

      const updatedProduct = await ProductController.productService.updateProduct(id, req.body);
      if (updatedProduct) {
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Failed to update product' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await ProductController.productService.deleteProduct(req.body.id);
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public deleteMultipleProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await ProductController.productService.deleteMultipleProducts(req.body.ids);
      res.status(200).send(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public saveDraft = async (req: Request, res: Response): Promise<void> => {
    try {
      // Always set status as draft
      req.body.status = ProductStatus.draft;

      // Check if we're updating an existing draft
      if (req.body.product_id) {
        const existingProduct = await ProductController.productService.getProductById(req.body.id);
        if (!existingProduct) {
          res.status(404).json({ message: 'Draft not found' });
          return;
        }
        console.log('EXISTING PRODUCT: ', existingProduct);

        // Update existing draft - fix: pass product ID as first parameter
        console.log('Updating draft:');
        const updatedDraft = await ProductController.productService.updateProduct(req.body.id, req.body);
        res.json(updatedDraft);
      } else {
        // Create new draft
        const draft = await ProductController.productService.createProduct(req.body);
        res.json(draft);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // IMPORT ITEMS
  public importProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      // console.log('Importing products:', req.body);
      req.body.product_id = randomUUID();
      const imports = await ProductController.productService.saveImports(req.body);
      res.json({ success: true, message: 'Products imported successfully', imports });
    } catch (error: any) {
      let status = 500;
      let message = 'Internal server error';
      if (error instanceof Error) {
        if (error.message === 'Validation failed') status = 400;
        else if (error.message === 'Seller with user_id ' + req.body.user_id + ' not found') status = 404;
        else if (error.message.startsWith('Marketplace with ID')) status = 409;
        message = error.message;
      }
      res.status(status).json({ success: false, message });
    }
  };

  public fillMissingFields = async (req: Request, res: Response): Promise<void> => {
    try {
      // receive partial product 
      // receive flag to whether save to backend as well or just return to frontend
      const { product, saveToBackend = false } = req.body;
      
      if (!product) {
        res.status(400).json({ success: false, message: 'No product data provided' });
        return;
      }
      
      // pass to inference to complete the required listing details
      const productService = new ProductService();
      const completeProduct = await productService.fillMissingFields(product, saveToBackend);
      
      // Return the complete product with filled-in missing fields
      res.status(200).json({ 
        success: true, 
        message: 'Product details completed successfully', 
        product: completeProduct 
      });
      
    } catch (error: any) {
      console.error('Error in importCrossList:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public addToImport = async (req: Request, res: Response): Promise<void> => {
    try {
      // console.log('Importing products:', req.body);
      req.body.product_id = randomUUID();
      const imports = await ProductController.productService.saveImports(req.body);
      res.json({ success: true, message: 'Products imported successfully', imports });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  public importSoldProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      // console.log('Importing products:', req.body);
      req.body.product_id = randomUUID();
      const imports = await ProductController.productService.saveImports(req.body);
      res.json({ success: true, message: 'Products imported successfully', imports });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Current Products that have the most wishlist + likes + views
  public getTrendingProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const topProducts = await ProductController.productService.getTrendingProducts();
      res.json(topProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // public getProductsByStyle = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const products = await ProductController.productService.getProductsByStyle(req.params.style);
  //     res.json(products);
  //   } catch (error: any) {
  //     res.status(500).json({ message: error.message });
  //   }
  // };

  getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await ProductController.productService.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public filterProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await ProductController.productService.filterProducts(req.body);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public bulkUpload = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await ProductController.productService.bulkUploadProducts(req.body);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public inferenceImages = async (req: Request, res: Response): Promise<void> => {
    try {
      const images = req.body.images;
      if (!Array.isArray(images) || !images.every((img) => img.image_id && img.url)) {
        res.status(400).json({ message: "Request body must contain 'images' array with image_id and url for each image" });
        return;
      }
      const products = await ProductController.productService.inferenceImages(
        images,
        req.body.titleTemplate,
        req.body.descriptionTemplate,
        req.body.sellerID,
        req.body.exampleDescription,
        req.body.tags,
      );
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // Marketplace related
  public deleteMarketplaceListing = async (req: Request, res: Response): Promise<void> => {
    const product_id = req.query.product_id?.toString();
    const marketplace = req.query.marketplace?.toString();

    if (!product_id || !marketplace) {
      res.status(400).json({ message: 'Product ID and Marketplace are required' });
      return;
    }

    try {
      await ProductController.productService.deleteMarketplaceListing(product_id, marketplace);

      res.status(200).json({ success: true, message: 'Marketplace listing deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public delistMarketplaceListing = async (req: Request, res: Response): Promise<void> => {
    const product_id = req.query.product_id?.toString();
    const marketplace = req.query.marketplace?.toString();

    if (!product_id || !marketplace) {
      res.status(400).json({ message: 'Product ID and Marketplace are required' });
      return;
    }

    try {
      await ProductController.productService.delistMarketplaceListing(product_id, marketplace);

      res.status(200).json({ success: true, message: 'Marketplace listing deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getOtherMarketplaceListings = async (req: Request, res: Response): Promise<void> => {
    const marketplaceId = req.query.marketplace_id?.toString();
    const soldMarketplace = req.query.sold_marketplace?.toString();

    if (!marketplaceId || !soldMarketplace) {
      res.status(400).json({ success: false, message: 'Marketplace ID and Sold Marketplace are required' });
      return;
    }

    try {
      const result = await ProductController.productService.getOtherMarketplaceListings(marketplaceId, soldMarketplace);

      res.status(200).json({
        success: true,
        product_id: result.product_id,
        otherListings: result.otherListings,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
