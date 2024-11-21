import { AppDataSource } from '../database/config';
import { Cart } from '../entity/cart.entity';
import { CartItem } from '../entity/cart_item.entity';

export const CartRepository = AppDataSource.getRepository(Cart).extend({
  async findByUserId(userId: string): Promise<Cart | null> {
    return this.createQueryBuilder('cart')
      .leftJoinAndSelect('cart.cartItems', 'cartItems')
      .leftJoinAndSelect('cartItems.product', 'product')
      .where('cart.user_id = :userId', { userId })
      .andWhere('cart.order_status = :status', { status: 'active' })
      .getOne();
  },

  async createAndSave(cartData: Partial<Cart>): Promise<Cart> {
    const cart = this.create(cartData);
    return this.save(cart);
  },

  async addItemToCart(cartId: string, productId: string): Promise<Cart> {
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    
    // Check if item already exists in cart
    const existingItem = await cartItemRepository.findOne({
      where: {
        cart: { id: cartId },
        product: { product_id: productId }
      }
    });

    if (existingItem) {
      throw new Error('Product already in cart');
    }

    const cart = await this.findOne({
      where: { id: cartId },
      relations: ['cartItems']
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const cartItem = cartItemRepository.create({
      cart: cart,
      product: { product_id: productId },
      order_item_status: 'pending',
      created_at: new Date()
    });

    cart.cartItems.push(cartItem);
    return this.save(cart);
  },

  async removeItemFromCart(cart: Cart, productId: string): Promise<Cart> {
    cart.cartItems = cart.cartItems.filter(item => item.product.product_id !== productId);
    return this.save(cart);
  },

  async updateCartStatus(cartId: string, status: string): Promise<Cart | null> {
    await this.update(cartId, { order_status: status });
    return this.findOne({ where: { id: cartId } });
  }
});
