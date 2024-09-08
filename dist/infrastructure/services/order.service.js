"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/infrastructure/services/order.service.ts
var order_service_exports = {};
__export(order_service_exports, {
  OrderService: () => OrderService
});
module.exports = __toCommonJS(order_service_exports);

// src/infrastructure/db/database.ts
var import_typeorm = require("typeorm");
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var { PGHOST, PGDATABASE, PGPASSWORD, PGUSER, ENDPOINT_ID } = process.env;
var AppDataSource = new import_typeorm.DataSource({
  type: "postgres",
  host: PGHOST,
  port: 5432,
  username: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  ssl: true,
  logging: true,
  entities: [__dirname + "/../../core/entity/*.model.{ts, js, mjs}"],
  // entities: [__dirname + '/core/entity/*.model.js'],
  synchronize: true,
  cache: false
});
console.log("DATABASE CONNECTION: ", __dirname + "core/entity/*.model.js");
var database_default = AppDataSource;

// src/core/entity/order.model.ts
var import_typeorm7 = require("typeorm");

// src/core/entity/product.model.ts
var import_typeorm6 = require("typeorm");

// src/core/entity/seller.model.ts
var import_typeorm2 = require("typeorm");
var Seller = class {
  seller_id;
  email;
  store_name;
  store_description;
  store_logo;
  Products;
};
__decorateClass([
  (0, import_typeorm2.PrimaryGeneratedColumn)()
], Seller.prototype, "seller_id", 2);
__decorateClass([
  (0, import_typeorm2.Column)("varchar")
], Seller.prototype, "email", 2);
__decorateClass([
  (0, import_typeorm2.Column)("varchar")
], Seller.prototype, "store_name", 2);
__decorateClass([
  (0, import_typeorm2.Column)({ type: "varchar", nullable: true })
], Seller.prototype, "store_description", 2);
__decorateClass([
  (0, import_typeorm2.Column)({ type: "varchar", nullable: true })
], Seller.prototype, "store_logo", 2);
__decorateClass([
  (0, import_typeorm2.OneToMany)(() => Product, (product) => product.seller),
  (0, import_typeorm2.JoinColumn)({ name: "product_id" })
], Seller.prototype, "Products", 2);
Seller = __decorateClass([
  (0, import_typeorm2.Entity)()
], Seller);

// src/utils/products.enums.ts
var ProductCategory = /* @__PURE__ */ ((ProductCategory2) => {
  ProductCategory2["Shirt"] = "Shirt";
  ProductCategory2["Pants"] = "Pants";
  ProductCategory2["Dress"] = "Dress";
  ProductCategory2["Jacket"] = "Jacket";
  ProductCategory2["Coat"] = "Coat";
  ProductCategory2["Suit"] = "Suit";
  ProductCategory2["Blazer"] = "Blazer";
  ProductCategory2["Sweater"] = "Sweater";
  ProductCategory2["Cardigan"] = "Cardigan";
  ProductCategory2["Top"] = "Top";
  ProductCategory2["Blouse"] = "Blouse";
  ProductCategory2["Tshirt"] = "Tshirt";
  ProductCategory2["Tanktop"] = "Tanktop";
  ProductCategory2["Jumpsuit"] = "Jumpsuit";
  ProductCategory2["Skirts"] = "Skirts";
  ProductCategory2["Other"] = "Other";
  return ProductCategory2;
})(ProductCategory || {});

// src/core/entity/product_interactions.model.ts
var import_typeorm5 = require("typeorm");

// src/core/entity/user.model.ts
var import_typeorm4 = require("typeorm");

// src/core/entity/transaction.model.ts
var import_typeorm3 = require("typeorm");
var Transaction = class extends import_typeorm3.BaseEntity {
  id;
  created_at;
  updated_at;
  client;
};
__decorateClass([
  (0, import_typeorm3.PrimaryGeneratedColumn)("uuid")
], Transaction.prototype, "id", 2);
__decorateClass([
  (0, import_typeorm3.Column)({ type: "timestamptz" })
], Transaction.prototype, "created_at", 2);
__decorateClass([
  (0, import_typeorm3.Column)({ type: "timestamptz" })
], Transaction.prototype, "updated_at", 2);
__decorateClass([
  (0, import_typeorm3.OneToMany)(() => Transaction, (transaction) => transaction.client),
  (0, import_typeorm3.JoinColumn)({
    name: "user_id"
  })
], Transaction.prototype, "client", 2);
Transaction = __decorateClass([
  (0, import_typeorm3.Entity)()
], Transaction);

// src/core/entity/user.model.ts
var User = class extends import_typeorm4.BaseEntity {
  user_id;
  firstName;
  lastName;
  email;
  cart;
  password;
  country;
  city;
  postalCode;
  phone;
  resetToken;
  expiryToken;
  avatar;
  createdAt;
  updatedAt;
  orders;
  transactions;
  interactions;
  isSeller;
};
__decorateClass([
  (0, import_typeorm4.PrimaryGeneratedColumn)("uuid")
], User.prototype, "user_id", 2);
__decorateClass([
  (0, import_typeorm4.Column)("varchar")
], User.prototype, "firstName", 2);
__decorateClass([
  (0, import_typeorm4.Column)("varchar")
], User.prototype, "lastName", 2);
__decorateClass([
  (0, import_typeorm4.Column)({
    type: "varchar",
    unique: true
  })
], User.prototype, "email", 2);
__decorateClass([
  (0, import_typeorm4.Column)({
    type: "simple-array",
    default: []
  })
], User.prototype, "cart", 2);
__decorateClass([
  (0, import_typeorm4.Column)("varchar")
], User.prototype, "password", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "simple-array", nullable: true })
], User.prototype, "country", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "varchar", nullable: true })
], User.prototype, "city", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "varchar", nullable: true })
], User.prototype, "postalCode", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "varchar", nullable: true })
], User.prototype, "phone", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "varchar", nullable: true })
], User.prototype, "resetToken", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "date", nullable: true })
], User.prototype, "expiryToken", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "varchar", nullable: true })
], User.prototype, "avatar", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "date", default: () => "CURRENT_TIMESTAMP" })
], User.prototype, "createdAt", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "date", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
], User.prototype, "updatedAt", 2);
__decorateClass([
  (0, import_typeorm4.OneToMany)(() => Order, (order) => order.customer)
], User.prototype, "orders", 2);
__decorateClass([
  (0, import_typeorm4.OneToMany)(() => Transaction, (transaction) => transaction.client)
], User.prototype, "transactions", 2);
__decorateClass([
  (0, import_typeorm4.OneToMany)(() => ProductInteraction, (interaction) => interaction.user)
], User.prototype, "interactions", 2);
__decorateClass([
  (0, import_typeorm4.Column)({ type: "boolean", default: false })
], User.prototype, "isSeller", 2);
User = __decorateClass([
  (0, import_typeorm4.Entity)({ name: "users_table" })
], User);

// src/core/entity/product_interactions.model.ts
var ProductInteraction = class {
  interaction_id;
  product;
  user;
  interaction_type;
  interaction_date;
};
__decorateClass([
  (0, import_typeorm5.PrimaryGeneratedColumn)()
], ProductInteraction.prototype, "interaction_id", 2);
__decorateClass([
  (0, import_typeorm5.ManyToOne)(() => Product, (product) => product.interactions, { onDelete: "CASCADE" }),
  (0, import_typeorm5.JoinColumn)({ name: "product_id" })
], ProductInteraction.prototype, "product", 2);
__decorateClass([
  (0, import_typeorm5.ManyToOne)(() => User, (user) => user.interactions, { onDelete: "CASCADE" }),
  (0, import_typeorm5.JoinColumn)({ name: "user_id" })
], ProductInteraction.prototype, "user", 2);
__decorateClass([
  (0, import_typeorm5.Column)("varchar")
], ProductInteraction.prototype, "interaction_type", 2);
__decorateClass([
  (0, import_typeorm5.Column)("date")
], ProductInteraction.prototype, "interaction_date", 2);
ProductInteraction = __decorateClass([
  (0, import_typeorm5.Entity)()
], ProductInteraction);

// src/core/entity/product.model.ts
var Product = class {
  product_id;
  name;
  description;
  price;
  color;
  listed_size;
  product_category;
  brand;
  gender;
  tags;
  imageURLS;
  seller;
  material;
  dimensions;
  interactions;
};
__decorateClass([
  (0, import_typeorm6.PrimaryColumn)("varchar")
], Product.prototype, "product_id", 2);
__decorateClass([
  (0, import_typeorm6.Column)("varchar")
], Product.prototype, "name", 2);
__decorateClass([
  (0, import_typeorm6.Column)("varchar")
], Product.prototype, "description", 2);
__decorateClass([
  (0, import_typeorm6.Column)("float")
], Product.prototype, "price", 2);
__decorateClass([
  (0, import_typeorm6.Column)({
    type: "simple-json",
    nullable: false
  })
], Product.prototype, "color", 2);
__decorateClass([
  (0, import_typeorm6.Column)("varchar")
], Product.prototype, "listed_size", 2);
__decorateClass([
  (0, import_typeorm6.Column)({
    type: "simple-enum",
    enum: ProductCategory
  })
], Product.prototype, "product_category", 2);
__decorateClass([
  (0, import_typeorm6.Column)("varchar")
], Product.prototype, "brand", 2);
__decorateClass([
  (0, import_typeorm6.Column)("varchar")
], Product.prototype, "gender", 2);
__decorateClass([
  (0, import_typeorm6.Column)({ type: "simple-array", default: [] })
], Product.prototype, "tags", 2);
__decorateClass([
  (0, import_typeorm6.Column)({ type: "simple-array", default: [] })
], Product.prototype, "imageURLS", 2);
__decorateClass([
  (0, import_typeorm6.ManyToOne)(() => Seller, (seller) => seller.seller_id, { onDelete: "CASCADE" }),
  (0, import_typeorm6.JoinColumn)({ name: "seller_id" })
], Product.prototype, "seller", 2);
__decorateClass([
  (0, import_typeorm6.Column)({ type: "varchar", nullable: true, default: null })
], Product.prototype, "material", 2);
__decorateClass([
  (0, import_typeorm6.Column)({ type: "varchar", nullable: true })
], Product.prototype, "dimensions", 2);
__decorateClass([
  (0, import_typeorm6.OneToMany)(() => ProductInteraction, (interaction) => interaction.product),
  (0, import_typeorm6.JoinColumn)({ name: "interaction_id" })
], Product.prototype, "interactions", 2);
Product = __decorateClass([
  (0, import_typeorm6.Entity)()
], Product);

// src/core/entity/order.model.ts
var Order = class {
  id;
  customer;
  orderItems;
  totalAmount;
  status;
  paymentMethod;
  createdAt;
  updatedAt;
};
__decorateClass([
  (0, import_typeorm7.PrimaryGeneratedColumn)("uuid")
], Order.prototype, "id", 2);
__decorateClass([
  (0, import_typeorm7.ManyToOne)(() => User, (user) => user.orders),
  (0, import_typeorm7.JoinTable)()
], Order.prototype, "customer", 2);
__decorateClass([
  (0, import_typeorm7.OneToMany)(() => OrderItem, (orderItem) => orderItem.order)
], Order.prototype, "orderItems", 2);
__decorateClass([
  (0, import_typeorm7.Column)("money")
], Order.prototype, "totalAmount", 2);
__decorateClass([
  (0, import_typeorm7.Column)({
    type: "enum",
    enum: ["recieved", "pending", "shipped", "delivered", "cancelled"],
    default: "pending"
  })
], Order.prototype, "status", 2);
__decorateClass([
  (0, import_typeorm7.Column)("varchar")
], Order.prototype, "paymentMethod", 2);
__decorateClass([
  (0, import_typeorm7.Column)({ type: "timestamptz" })
], Order.prototype, "createdAt", 2);
__decorateClass([
  (0, import_typeorm7.Column)({ type: "timestamptz" })
], Order.prototype, "updatedAt", 2);
Order = __decorateClass([
  (0, import_typeorm7.Entity)()
], Order);
var OrderItem = class {
  id;
  order;
  product;
};
__decorateClass([
  (0, import_typeorm7.PrimaryGeneratedColumn)()
], OrderItem.prototype, "id", 2);
__decorateClass([
  (0, import_typeorm7.ManyToOne)(() => Order, (order) => order.orderItems)
], OrderItem.prototype, "order", 2);
__decorateClass([
  (0, import_typeorm7.ManyToOne)(() => Product)
], OrderItem.prototype, "product", 2);
OrderItem = __decorateClass([
  (0, import_typeorm7.Entity)()
], OrderItem);

// src/infrastructure/services/order.service.ts
var OrderService = class {
  orderRepository;
  constructor() {
    this.orderRepository = database_default.getRepository(Order);
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