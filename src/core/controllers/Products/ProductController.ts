import { Request, Response } from 'express';
import { ProductService } from '../../../infrastructure/services/product.service';

export class ProductController {
  static productService: ProductService = new ProductService();

  public addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await ProductController.productService.createProduct(req.body);
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

  public getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await ProductController.productService.fetchProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getSpecificProduct = async (req: Request, res: Response): Promise<void> => {
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

  public createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await ProductController.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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
}
