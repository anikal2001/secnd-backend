import { Request, Response } from 'express';
import { plainToClass } from "class-transformer";
import { SellerService } from "../../../infrastructure/services/seller.service";
import { Seller } from "../../entity/seller.model";


export class SellerController{
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
            const seller = await SellerController.sellerService.getSellerById(Number(req.params.id));
            if (seller) {
                res.json(seller);
            } else {
                res.status(404).json({ message: 'Seller not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    public getSellerProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await SellerController.sellerService.getSellerProducts(Number(req.params.id));
            if (products) {
                res.json(products);
            } else {
                res.status(404).json({ message: 'Seller not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    public getSellerRevenues = async (req: Request, res: Response): Promise<void> => {
        try {
            const sellerID = Number(req.params.id);
            const revenues = await SellerController.sellerService.getSellerRevenues(sellerID);
            if (revenues) {
                res.json(revenues);
            } else {
                res.status(404).json({ message: 'Seller not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    public getSellerOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const sellerID = Number(req.params.id);
            const orders = await SellerController.sellerService.getSellerOrders(sellerID);
            if (orders) {
                res.json(orders);
            } else {
                res.status(404).json({ message: 'Seller not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    public updateSeller = async (req: Request, res: Response): Promise<void> => {
        try {
            const sellerId = Number(req.params.id);
            const updatedSeller = await SellerController.sellerService.updateSeller(sellerId, req.body);
            if (updatedSeller) {
                res.json(updatedSeller);
            } else {
                res.status(404).json({ message: 'Seller not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

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
    }

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
    }
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
    }


    public getTrendingProductsForSeller = async (req: Request, res: Response): Promise<void> => {
        try {
            const sellerID = Number(req.params.id);
            const trendingProducts = await SellerController.sellerService.getTrendingProducts(sellerID);
            if (trendingProducts) {
                res.json(trendingProducts);
            } else {
                res.status(404).json({ message: 'No trending products found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}