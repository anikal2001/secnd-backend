import { Request, Response } from 'express';
import { plainToClass } from "class-transformer";
import { SellerService } from "../../../infrastructure/services/seller.service";
import { CreateSellerDto } from "../../../infrastructure/dto/CreateSellerDTO";


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
            const newSeller = plainToClass(CreateSellerDto, req.body);
            const seller = await SellerController.sellerService.createSeller(newSeller);
            res.status(201).json(seller);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };
}