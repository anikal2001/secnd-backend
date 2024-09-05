"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/infrastructure/services/order.service.ts
var order_service_exports = {};
__export(order_service_exports, {
  OrderService: () => OrderService
});
module.exports = __toCommonJS(order_service_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OrderService
});
//# sourceMappingURL=order.service.js.map