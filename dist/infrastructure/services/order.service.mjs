// src/infrastructure/services/order.service.ts
var OrderService = class {
  orderRepository;
  constructor() {
    this.orderRepository = null;
  }
  async getAllOrders() {
    return await this.orderRepository.find();
  }
  async getOrderById(id) {
    const order = await this.orderRepository.findOne({ where: { id: Number(id) } });
    return order ? order.orderItems : [];
  }
  async createOrder(orderData) {
    const order = this.orderRepository.create({ ...orderData, id: Number(orderData.id) });
    await this.orderRepository.insert(order);
    return order;
  }
};
export {
  OrderService
};
//# sourceMappingURL=order.service.mjs.map