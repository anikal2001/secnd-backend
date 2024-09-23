import { AppDataSource } from '../database/config';
import { Cart } from '../entity/cart.entity';
import { plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';

export const CartRepository = AppDataSource.getRepository(Cart).extend({

    async findByUserId(userId: string): Promise<Cart> {
        const cart = await this.createQueryBuilder('cart')
            .leftJoinAndSelect('cart.items', 'product')
            .where('cart.user_id = :userId', { userId })
            .getOne();
        return plainToInstance(Cart, cart);
    },

    async createAndSave(cartData: Partial<Cart>): Promise<Cart | null> {
        const cart = this.create(cartData);
        return this.save(cart);
    },

    async updateCartItems(userId: string, items: Product[]): Promise<Cart> {
        const cart = await this.findByUserId(userId);
        cart.items = items;
        return this.save(cart);
    }
});
