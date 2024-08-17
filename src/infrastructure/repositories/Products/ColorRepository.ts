import AppDataSource from '../../db/database';
import { Order } from '../../../core/entity/order.model';

export const OrderRepository = AppDataSource.getRepository(Order).extend({
  async findWithProducts(orderId: number, productId: string): Promise<Order | null> {
    const order = this.findOne({ where: { id: Number(productId) }, relations: ['products'] });
    return order;
  },
});
