import { OrderType, OrderItemType } from '../../types/order';

export class OrderService {
  private orderRepository: { find: () => Order[] | PromiseLike<Order[]>; findOne: (arg0: { where: { id: number; }; }) => any; create: (arg0: { id: number; customer: User; orderItems: OrderItem[]; totalAmount: number; products: Product[]; total: number; status: string; createdAt: Date; updatedAt: Date; }) => any; insert: (arg0: any) => any; } | null;
  constructor() {
    this.orderRepository = null;
  }

  async getAllOrders(): Promise<Order[]> {
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
