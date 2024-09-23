import { CartRepository } from '../repositories/cart.repository';
import { Cart } from '../entity/cart.entity';
import { Product } from '../entity/product.entity';

export class CartService {

    async getCart(userId: string): Promise<Cart> {
        return CartRepository.findByUserId(userId);
    }

    async addItemToCart(userId: string, product: Product): Promise<Cart | Error> {
        const cart = await CartRepository.findByUserId(userId);
        // Check if the product is already in the cart
        const existingProduct = cart.items.find((item: Product) => item.product_id === product.product_id);
        if (existingProduct) {
            return Error('Product already in cart');
        }
        cart.items.push(product);

        return CartRepository.save(cart);
    }

    async removeItemFromCart(userId: string, productId: string): Promise<Cart> {
        const cart = await CartRepository.findByUserId(userId);
        cart.items = cart.items.filter((item: Product) => item.product_id !== productId);

        return CartRepository.save(cart);
    }

    async clearCart(userId: string): Promise<Cart> {
        const cart = await CartRepository.findByUserId(userId);
        cart.items = [];

        return CartRepository.save(cart);
    }

    async getCartTotal(userId: string): Promise<number> {
        const cart = await CartRepository.findByUserId(userId);
        return cart.items.reduce((total: number, item: Product) => total + item.price, 0);
    }
}