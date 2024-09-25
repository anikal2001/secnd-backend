import { Request, Response, NextFunction } from 'express';
import multer from "multer";
import { ProductService } from '../services/product.service';

export class ProductController {
  static productService: ProductService = new ProductService();

  private upload: multer.Multer;  // Multer instance

  constructor() {
    const storage = multer.memoryStorage();
    this.upload = multer({ dest: 'uploads/', storage: storage });
  }

  public addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      this._handleFileUpload('images')(req, res, async (err) => {
        if (err) {
          // This will be handled by the `handleFileUploadErrors` middleware
          return;
        }
        console.log()

        // Ensure request body is present
        if (!req.body) {
          res.status(400).json({ message: 'Request body is required' });
          return;
        }

        // Access uploaded files 
        const imageFiles = (req as any).files as Express.Multer.File[];
        if (!imageFiles) {
          res.status(400).json({ message: 'Images are required' });
          return;
        }
        console.log(imageFiles)

        // Create product
        const product = await ProductController.productService.createProduct(req.body, imageFiles);

        if (!product) {
          res.status(400).json({ message: 'Product already exists' });
          return;
        }

        res.status(201).json(product);
      });
    } catch (error: any) {
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
    console.error("Error during file upload:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
    next();
  }

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
      const product = await ProductController.productService.getProductById(req.params.id);
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
      const updatedProduct = await ProductController.productService.updateProduct(req.params.id, req.body);
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

  // Current Products that have the most wishlist + likes + views
  public getTrendingProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const topProducts = await ProductController.productService.getTrendingProducts();
      res.json(topProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public getProductsByStyle = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await ProductController.productService.getProductsByStyle(req.params.style);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await ProductController.productService.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }


  public filterProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await ProductController.productService.filterProducts(req.body);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
    
    public bulkUpload = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await ProductController.productService.bulkUploadProducts(req.body);
            res.json(products);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
