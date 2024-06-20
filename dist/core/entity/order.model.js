"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.Order = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const product_model_1 = require("./product.model"); // Assuming Product entity is defined elsewhere
const user_model_1 = require("./user.model"); // Assuming User entity is defined elsewhere
let Order = class Order {
};
exports.Order = Order;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", Number)
], Order.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_model_1.User, user => user.orders),
    (0, typeorm_1.JoinTable)(),
    tslib_1.__metadata("design:type", user_model_1.User)
], Order.prototype, "customer", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => OrderItem, orderItem => orderItem.order),
    tslib_1.__metadata("design:type", Array)
], Order.prototype, "orderItems", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['recieved', 'pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "paymentMethod", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], Order);
let OrderItem = class OrderItem {
};
exports.OrderItem = OrderItem;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], OrderItem.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => Order, order => order.orderItems),
    tslib_1.__metadata("design:type", Order)
], OrderItem.prototype, "order", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => product_model_1.Product),
    tslib_1.__metadata("design:type", product_model_1.Product)
], OrderItem.prototype, "product", void 0);
exports.OrderItem = OrderItem = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], OrderItem);
