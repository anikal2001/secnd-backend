import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import { ProductService } from '../services/product.service';
import { ListingDraftService } from '../services/listingdraft.service';

export class ProductController {
  static productService: ProductService = new ProductService();
  static listingDraftService: ListingDraftService = new ListingDraftService();

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

      console.log("Parsed Body:", req.body);

      const productDetails = await ProductController.productService.generateProductDetails(sellerID, imageURL);

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
      console.log('Adding product...');
      console.log(req.body);
      // Ensure request body is present
      if (!req.body) {
        res.status(400).json({ message: 'Request body is required' });
        return;
      }

      if (!req.body.pictureIds || !Array.isArray(req.body.pictureIds) || req.body.pictureIds.length === 0) {
        res.status(400).json({ message: 'At least one picture ID is required' });
        return;
      }
      console.log(req.body);

      const product = await ProductController.productService.createProduct(req.body);

      if (!product) {
        res.status(400).json({ message: 'Failed to create product' });
        return;
      }

      res.status(201).json(product);
    } catch (error: any) {
      console.error('Add product error:', error);
      res.status(400).json({ message: error.message });
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
        console.log('Uploading Image...');
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
      res.status(200).json(products);
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
      const id = req.query.id?.toString();
      if (!id) {
        res.status(400).json({ message: 'Product ID is required' });
        return;
      }
      const updatedProduct = await ProductController.productService.updateProduct(id, req.body);
      if (updatedProduct) {
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Product not found' });
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
  public saveDraft = async (req: Request, res: Response): Promise<void> => {
    const userId = req.body.userId;
    console.log(req);
    console.log('User ID:', userId);
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    try {
      const draft = await ProductController.listingDraftService.saveDraft(userId, req.body);
      res.json(draft);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

  public getProductsByStyle = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await ProductController.productService.getProductsByStyle(req.params.style);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

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
}
