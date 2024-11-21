import { CartRepository } from '../repositories/cart.repository';
import { Cart } from '../entity/cart.entity';
import { AppDataSource } from '../database/config';
import { CartItem } from '../entity/cart_item.entity';
import { LessThan } from 'typeorm';

export class CartService {
  private static EXPIRATION_HOURS = 3;

  async getCart(userId: string): Promise<Cart> {
    const cart = await CartRepository.findByUserId(userId);
    if (cart) {
      await this.cleanupExpiredItems(cart.id);
      // Refresh cart after cleanup
      const updatedCart = await CartRepository.findByUserId(userId);
      return updatedCart || this.createEmptyCart(userId);
    }
    return this.createEmptyCart(userId);
  }

  private createEmptyCart(userId: string): Cart {
    return {
      id: '',
      user_id: userId,
      order_status: 'active',
      cartItems: []
    } as Cart;
  }

  async createCart(userId: string): Promise<Cart> {
    return CartRepository.createAndSave({
      user_id: userId,
      order_status: 'active',
      cartItems: []
    });
  }

  // @Anirudh - I call cleanup whenever an item is added. (will have to move to cron job in future)
  async addItemToCart(userId: string, productId: string): Promise<Cart> {
    let cart = await CartRepository.findByUserId(userId);
    
    if (!cart) {
      cart = await this.createCart(userId);
    }

    await this.cleanupExpiredItems(cart.id);

    return CartRepository.addItemToCart(cart.id, productId);
  }

  async removeItemFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await CartRepository.findByUserId(userId);
    
    if (!cart) {
      return this.createEmptyCart(userId);
    }

    return CartRepository.removeItemFromCart(cart, productId);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await CartRepository.findByUserId(userId);
    
    if (!cart) {
      return this.createEmptyCart(userId);
    }

    cart.cartItems = [];
    return CartRepository.save(cart);
  }

  async getCartTotal(userId: string): Promise<number> {
    const cart = await CartRepository.findByUserId(userId);
    
    if (!cart || !cart.cartItems) {
      return 0;
    }

    return cart.cartItems.reduce((total: number, item: CartItem) => {
      return total + (item.product?.price || 0);
    }, 0);
  }

  async updateCartStatus(cartId: string, status: string): Promise<Cart | null> {
    const cart = await CartRepository.updateCartStatus(cartId, status);
    return cart || null;
  }

  private async cleanupExpiredItems(cartId: string): Promise<void> {
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - CartService.EXPIRATION_HOURS);

    await cartItemRepository.delete({
      created_at: LessThan(expirationDate),
      cart: { id: cartId }
    });
  }

  async cleanupAllExpiredItems(): Promise<void> {
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - CartService.EXPIRATION_HOURS);

    await cartItemRepository.delete({
      created_at: LessThan(expirationDate)
    });
  }
}
