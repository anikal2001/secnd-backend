var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/infrastructure/db/database.ts
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();
var { PGHOST, PGDATABASE, PGPASSWORD, PGUSER, ENDPOINT_ID } = process.env;
var AppDataSource = new DataSource({
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
import { Entity as Entity6, Column as Column6, ManyToOne as ManyToOne4, OneToMany as OneToMany5, PrimaryGeneratedColumn as PrimaryGeneratedColumn6, JoinTable } from "typeorm";

// src/core/entity/product.model.ts
import { Column as Column5, Entity as Entity5, JoinColumn as JoinColumn4, ManyToOne as ManyToOne3, OneToMany as OneToMany4, PrimaryColumn } from "typeorm";

// src/core/entity/seller.model.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from "typeorm";
var Seller = class {
  seller_id;
  email;
  store_name;
  store_description;
  store_logo;
  Products;
};
__decorateClass([
  PrimaryGeneratedColumn()
], Seller.prototype, "seller_id", 2);
__decorateClass([
  Column("varchar")
], Seller.prototype, "email", 2);
__decorateClass([
  Column("varchar")
], Seller.prototype, "store_name", 2);
__decorateClass([
  Column({ type: "varchar", nullable: true })
], Seller.prototype, "store_description", 2);
__decorateClass([
  Column({ type: "varchar", nullable: true })
], Seller.prototype, "store_logo", 2);
__decorateClass([
  OneToMany(() => Product, (product) => product.seller),
  JoinColumn({ name: "product_id" })
], Seller.prototype, "Products", 2);
Seller = __decorateClass([
  Entity()
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
import { Entity as Entity4, PrimaryGeneratedColumn as PrimaryGeneratedColumn4, Column as Column4, ManyToOne as ManyToOne2, JoinColumn as JoinColumn3 } from "typeorm";

// src/core/entity/user.model.ts
import { BaseEntity as BaseEntity2, Column as Column3, Entity as Entity3, OneToMany as OneToMany3, PrimaryGeneratedColumn as PrimaryGeneratedColumn3 } from "typeorm";

// src/core/entity/transaction.model.ts
import { Entity as Entity2, PrimaryGeneratedColumn as PrimaryGeneratedColumn2, Column as Column2, JoinColumn as JoinColumn2, BaseEntity, OneToMany as OneToMany2 } from "typeorm";
var Transaction = class extends BaseEntity {
  id;
  created_at;
  updated_at;
  client;
};
__decorateClass([
  PrimaryGeneratedColumn2("uuid")
], Transaction.prototype, "id", 2);
__decorateClass([
  Column2({ type: "timestamptz" })
], Transaction.prototype, "created_at", 2);
__decorateClass([
  Column2({ type: "timestamptz" })
], Transaction.prototype, "updated_at", 2);
__decorateClass([
  OneToMany2(() => Transaction, (transaction) => transaction.client),
  JoinColumn2({
    name: "user_id"
  })
], Transaction.prototype, "client", 2);
Transaction = __decorateClass([
  Entity2()
], Transaction);

// src/core/entity/user.model.ts
var User = class extends BaseEntity2 {
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
  PrimaryGeneratedColumn3("uuid")
], User.prototype, "user_id", 2);
__decorateClass([
  Column3("varchar")
], User.prototype, "firstName", 2);
__decorateClass([
  Column3("varchar")
], User.prototype, "lastName", 2);
__decorateClass([
  Column3({
    type: "varchar",
    unique: true
  })
], User.prototype, "email", 2);
__decorateClass([
  Column3({
    type: "simple-array",
    default: []
  })
], User.prototype, "cart", 2);
__decorateClass([
  Column3("varchar")
], User.prototype, "password", 2);
__decorateClass([
  Column3({ type: "simple-array", nullable: true })
], User.prototype, "country", 2);
__decorateClass([
  Column3({ type: "varchar", nullable: true })
], User.prototype, "city", 2);
__decorateClass([
  Column3({ type: "varchar", nullable: true })
], User.prototype, "postalCode", 2);
__decorateClass([
  Column3({ type: "varchar", nullable: true })
], User.prototype, "phone", 2);
__decorateClass([
  Column3({ type: "varchar", nullable: true })
], User.prototype, "resetToken", 2);
__decorateClass([
  Column3({ type: "date", nullable: true })
], User.prototype, "expiryToken", 2);
__decorateClass([
  Column3({ type: "varchar", nullable: true })
], User.prototype, "avatar", 2);
__decorateClass([
  Column3({ type: "date", default: () => "CURRENT_TIMESTAMP" })
], User.prototype, "createdAt", 2);
__decorateClass([
  Column3({ type: "date", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
], User.prototype, "updatedAt", 2);
__decorateClass([
  OneToMany3(() => Order, (order) => order.customer)
], User.prototype, "orders", 2);
__decorateClass([
  OneToMany3(() => Transaction, (transaction) => transaction.client)
], User.prototype, "transactions", 2);
__decorateClass([
  OneToMany3(() => ProductInteraction, (interaction) => interaction.user)
], User.prototype, "interactions", 2);
__decorateClass([
  Column3({ type: "boolean", default: false })
], User.prototype, "isSeller", 2);
User = __decorateClass([
  Entity3({ name: "users_table" })
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
  PrimaryGeneratedColumn4()
], ProductInteraction.prototype, "interaction_id", 2);
__decorateClass([
  ManyToOne2(() => Product, (product) => product.interactions, { onDelete: "CASCADE" }),
  JoinColumn3({ name: "product_id" })
], ProductInteraction.prototype, "product", 2);
__decorateClass([
  ManyToOne2(() => User, (user) => user.interactions, { onDelete: "CASCADE" }),
  JoinColumn3({ name: "user_id" })
], ProductInteraction.prototype, "user", 2);
__decorateClass([
  Column4("varchar")
], ProductInteraction.prototype, "interaction_type", 2);
__decorateClass([
  Column4("date")
], ProductInteraction.prototype, "interaction_date", 2);
ProductInteraction = __decorateClass([
  Entity4()
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
  PrimaryColumn("varchar")
], Product.prototype, "product_id", 2);
__decorateClass([
  Column5("varchar")
], Product.prototype, "name", 2);
__decorateClass([
  Column5("varchar")
], Product.prototype, "description", 2);
__decorateClass([
  Column5("float")
], Product.prototype, "price", 2);
__decorateClass([
  Column5({
    type: "simple-json",
    nullable: false
  })
], Product.prototype, "color", 2);
__decorateClass([
  Column5("varchar")
], Product.prototype, "listed_size", 2);
__decorateClass([
  Column5({
    type: "simple-enum",
    enum: ProductCategory
  })
], Product.prototype, "product_category", 2);
__decorateClass([
  Column5("varchar")
], Product.prototype, "brand", 2);
__decorateClass([
  Column5("varchar")
], Product.prototype, "gender", 2);
__decorateClass([
  Column5({ type: "simple-array", default: [] })
], Product.prototype, "tags", 2);
__decorateClass([
  Column5({ type: "simple-array", default: [] })
], Product.prototype, "imageURLS", 2);
__decorateClass([
  ManyToOne3(() => Seller, (seller) => seller.seller_id, { onDelete: "CASCADE" }),
  JoinColumn4({ name: "seller_id" })
], Product.prototype, "seller", 2);
__decorateClass([
  Column5({ type: "varchar", nullable: true, default: null })
], Product.prototype, "material", 2);
__decorateClass([
  Column5({ type: "varchar", nullable: true })
], Product.prototype, "dimensions", 2);
__decorateClass([
  OneToMany4(() => ProductInteraction, (interaction) => interaction.product),
  JoinColumn4({ name: "interaction_id" })
], Product.prototype, "interactions", 2);
Product = __decorateClass([
  Entity5()
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
  PrimaryGeneratedColumn6("uuid")
], Order.prototype, "id", 2);
__decorateClass([
  ManyToOne4(() => User, (user) => user.orders),
  JoinTable()
], Order.prototype, "customer", 2);
__decorateClass([
  OneToMany5(() => OrderItem, (orderItem) => orderItem.order)
], Order.prototype, "orderItems", 2);
__decorateClass([
  Column6("money")
], Order.prototype, "totalAmount", 2);
__decorateClass([
  Column6({
    type: "enum",
    enum: ["recieved", "pending", "shipped", "delivered", "cancelled"],
    default: "pending"
  })
], Order.prototype, "status", 2);
__decorateClass([
  Column6("varchar")
], Order.prototype, "paymentMethod", 2);
__decorateClass([
  Column6({ type: "timestamptz" })
], Order.prototype, "createdAt", 2);
__decorateClass([
  Column6({ type: "timestamptz" })
], Order.prototype, "updatedAt", 2);
Order = __decorateClass([
  Entity6()
], Order);
var OrderItem = class {
  id;
  order;
  product;
};
__decorateClass([
  PrimaryGeneratedColumn6()
], OrderItem.prototype, "id", 2);
__decorateClass([
  ManyToOne4(() => Order, (order) => order.orderItems)
], OrderItem.prototype, "order", 2);
__decorateClass([
  ManyToOne4(() => Product)
], OrderItem.prototype, "product", 2);
OrderItem = __decorateClass([
  Entity6()
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
export {
  OrderService
};
//# sourceMappingURL=order.service.mjs.map