import { Request, Response } from 'express';
import { Product } from '../../entity/product.model';
import { validateOrReject } from 'class-validator';
import { ProductService } from '../../../infrastructure/services/product.service';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from '../../../infrastructure/dto/CreateProductDTO';

export class ProductController {
  static productService: ProductService = new ProductService();

  public addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure request is valid
      if (!req.body) {
        res.status(400).json({ message: 'Request body is required' });
        return;
      }
      // Ensure all required fields are present
      const product = await ProductController.productService.createProduct(req.body);
      if (!product) {
        res.status(400).json({ message: 'Product already exists' });
        return;
      }
      res.status(201).json(product);
    } catch (error: any) {
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

  
}
