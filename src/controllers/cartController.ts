import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {
    private static cartService: CartService = new CartService();

    async getCart(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            if (!userId || userId.trim() === '') {
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            const cart = await CartController.cartService.getCart(userId);
            return res.status(200).json(cart);
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async addToCart(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const { productId } = req.body;

            if (!userId || userId.trim() === '') {
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            if (!productId) {
                return res.status(400).json({ message: 'Product ID is required' });
            }

            try {
                const cart = await CartController.cartService.addItemToCart(userId, productId);
                return res.status(200).json(cart);
            } catch (error: any) {
                if (error.message === 'Product already in cart') {
                    return res.status(400).json({ message: error.message });
                }
                throw error;
            }
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async removeFromCart(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const { productId } = req.params;

            if (!userId || userId.trim() === '') {
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            if (!productId) {
                return res.status(400).json({ message: 'Product ID is required' });
            }

            const cart = await CartController.cartService.removeItemFromCart(userId, productId);
            return res.status(200).json(cart);
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async clearCart(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            
            if (!userId || userId.trim() === '') {
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            const cart = await CartController.cartService.clearCart(userId);
            return res.status(200).json(cart);
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async getCartTotal(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            
            if (!userId || userId.trim() === '') {
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            const total = await CartController.cartService.getCartTotal(userId);
            return res.status(200).json({ total });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async updateCartStatus(req: Request, res: Response) {
        try {
            const cartId = req.params.cartId;
            const { status } = req.body;

            if (!cartId || cartId.trim() === '') {
                return res.status(400).json({ message: 'Invalid cart ID' });
            }

            if (!status) {
                return res.status(400).json({ message: 'Status is required' });
            }

            const cart = await CartController.cartService.updateCartStatus(cartId, status);
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            return res.status(200).json(cart);
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}