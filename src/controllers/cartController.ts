import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

class CartController {
    static cartService: CartService = new CartService();


    async addToCart(req: Request, res: Response) {
        const { userId, productId } = req.body;
        try {
            const { productId, quantity } = req.body;
            const cart = await CartController.cartService.addItemToCart(userId, productId);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getCart(req: Request, res: Response) {
        const { userId } = req.body;
        try {
            const cart = await CartController.cartService.getCart(userId);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteFromCart(req: Request, res: Response) {
        const { userId } = req.body
        try {
            const { productId } = req.body;
            const cart = await CartController.cartService.removeItemFromCart(userId, productId);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getCartTotal(req: Request, res: Response) {
        const { userId } = req.body
        try {
            const total = await CartController.cartService.getCartTotal(userId);
            res.status(200).json({ total });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default CartController;