import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { SellerService } from '../services/seller.service';
import { Seller } from '../entity/seller.entity';
import { Category } from '../utils/product/category';
import { ProductStatus } from '../utils/products.enums';
import { ProductFilter } from '../interfaces/product.filter';

export class SellerController {
  static sellerService: SellerService = new SellerService();

  public getAllSellers = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellers = await SellerController.sellerService.fetchSellers();
      res.json(sellers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public addSeller = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure request is valid
      if (!req.body) {
        res.status(400).json({ message: 'Request body is required' });
        return;
      }
      // Ensure all required fields are present
      const newSeller = plainToClass(Seller, req.body);
      const seller = await SellerController.sellerService.createSeller(newSeller);
      res.status(201).json(seller);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  public getSellerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const seller = await SellerController.sellerService.getSellerById(req.params.id);
      if (seller) {
        res.json(seller);
      } else {
        res.status(404).json({ message: 'Seller not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getSellerProducts = async (req: Request, res: Response) => {
    try {
      const sellerId = req.params.id;
      const { category, status, startDate, endDate, page, limit, includeImages } = req.query;

      // Validate category if provided
      if (category && !Object.values(Category.getAllTopLevelCategories()).includes(category as string)) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      // Create filter object
      const filter: ProductFilter = {
        sellerId,
        status: status ? Number(status) as ProductStatus : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeImages: includeImages ? Boolean(includeImages) : undefined,
        category: category && typeof category === 'string' ? new Category(category) : undefined
      };

      // Create pagination object
      const pagination = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      };

      const products = await SellerController.sellerService.getSellerProducts(filter, pagination);
      res.json(products);
    } catch (error) {
      console.error('Error in getSellerProducts:', error);
      res.status(500).json({ error: 'Failed to get seller products' });
    }
  };


  getSellerProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerID = Number(req.params.id);
      const productID = Number(req.params.productID);
      // const product = await SellerController.sellerService.getSellerProductById(sellerID, productID);
      const product: any = { message: 'Route not implemented' };
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
  
  getProductInteractions = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerID = Number(req.params.id);
      const productID = Number(req.params.productID);
      // const interactions = await SellerController.sellerService.getProductInteractions(sellerID, productID);
      const interactions: string[] = ['Route not implemented'];
      if (interactions) {
        res.json(interactions);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getSellerRevenues = async (req: Request, res: Response): Promise<void> => {
    try {
      const revenues = await SellerController.sellerService.getSellerRevenues(req.params.id);
      console.log(revenues);
      if (revenues || revenues == 0) {
        res.json(revenues);
      } else {
        res.status(404).json({ message: 'Seller not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getSellerOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await SellerController.sellerService.getSellerOrders(req.params.id);
      if (orders || orders == 0) {
        res.json(orders);
      } else {
        res.status(404).json({ message: 'Seller not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getSellerCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
      const customers = await SellerController.sellerService.getSellerCustomers(req.params.id);
      if (customers) {
        res.json(customers);
      } else {
        res.status(404).json({ message: 'Seller not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public updateSeller = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.params.id;
      const updatedSeller = await SellerController.sellerService.updateSeller(sellerId, req.body);
      if (updatedSeller) {
        res.json(updatedSeller);
      } else {
        res.status(404).json({ message: 'Seller not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public deleteSeller = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await SellerController.sellerService.deleteSeller(req.body.id);
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(404).json({ message: 'Seller not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getTrendingSellers = async (req: Request, res: Response): Promise<void> => {
    try {
      const trendingSellers = await SellerController.sellerService.getTrendingSellers();
      if (trendingSellers) {
        res.json(trendingSellers);
      } else {
        res.status(404).json({ message: 'No trending sellers found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
  
  public getTopSellers = async (req: Request, res: Response): Promise<void> => {
    try {
      const topSellers = await SellerController.sellerService.getTopSellers();
      if (topSellers) {
        res.json(topSellers);
      } else {
        res.status(404).json({ message: 'No top sellers found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getTrendingProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const trendingProducts = await SellerController.sellerService.getTrendingProducts(req.params.id);
      if (trendingProducts) {
        res.json(trendingProducts);
      } else {
        res.status(404).json({ message: 'No trending products found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getSellerCategoryCounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.params.id;
      const categoryCounts = await SellerController.sellerService.getSellerCategoryCounts(sellerId);
      res.json(categoryCounts);
    } catch (error: any) {
      console.error('Error in getSellerCategoryCounts:', error);
      res.status(500).json({ error: 'Failed to get seller category counts' });
    }
  };
}
