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
import { plainToInstance } from "class-transformer";

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
      return plainToInstance(ProductDto, product);
    });
    return ProductsDTO;
  }
  // async findSellerById(sellerId: number): Promise<Seller | undefined> {
  //     return this.findOne({ where: { sellerId: sellerId } });
  // }
});
export {
  SellerRepository
};
//# sourceMappingURL=sellerRepository.mjs.map