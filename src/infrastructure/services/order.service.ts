import AppDataSource from '../db/database';
import { OrderType, OrderItemType } from '../../types/order';
import { Order } from '../../core/entity/order.model'

export class OrderService {
  private orderRepository;
  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  async getAllOrders(): Promise<Order[]> {
    // If the id is undefined, it will return all orders
    return await this.orderRepository.find() as Order[];
  }

  async getOrderById(id: string): Promise<OrderItemType[]> {
    const order = await this.orderRepository.findOne({ where: { id: Number(id) } });
    return order ? order.orderItems : [];
  }

  async createOrder(orderData: OrderType): Promise<Order | undefined> {
    const order = this.orderRepository.create({ ...orderData, id: Number(orderData.id) });
    await this.orderRepository.insert(order);
    return order as Order;
  }
}
