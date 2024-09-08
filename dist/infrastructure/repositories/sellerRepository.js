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

// src/infrastructure/repositories/sellerRepository.ts
var sellerRepository_exports = {};
__export(sellerRepository_exports, {
  SellerRepository: () => SellerRepository
});
module.exports = __toCommonJS(sellerRepository_exports);

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
  synchronize: true,
  cache: false
});
console.log("DATABASE CONNECTION: ", __dirname + "core/entity/*.model.js");
var database_default = AppDataSource;

// src/infrastructure/dto/SellerDTO.ts
var SellerDTO = class {
  seller_id;
  email;
  store_name;
  store_description;
  store_logo;
  products;
};

// src/infrastructure/repositories/sellerRepository.ts
var import_class_transformer = require("class-transformer");

// src/infrastructure/dto/ProductDTO.ts
var ProductDto = class {
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
  seller_id;
  // Assuming you want to pass only the seller ID in the DTO
  material;
  dimensions;
  interactions;
  // Assuming the DTO needs only the ID of the interactions
};

// src/infrastructure/repositories/sellerRepository.ts
var SellerRepository = database_default.getRepository(SellerDTO).extend({
  async createAndSave(sellerData) {
    const seller = this.create(sellerData);
    return this.save(seller);
  },
  async getSellerProducts(sellerId) {
    const Products = await this.createQueryBuilder("seller").leftJoinAndSelect("seller.products", "product").where("seller.seller_id = :sellerId", { sellerId }).getMany();
    const ProductsDTO = Products.map((product) => {
      return (0, import_class_transformer.plainToInstance)(ProductDto, product);
    });
    return ProductsDTO;
  }
  // async findSellerById(sellerId: number): Promise<Seller | undefined> {
  //     return this.findOne({ where: { sellerId: sellerId } });
  // }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SellerRepository
});
//# sourceMappingURL=sellerRepository.js.map