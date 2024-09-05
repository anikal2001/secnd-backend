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
  entities: ["src/core/entity/*.ts", __dirname + "/../**/*.entity.{js,ts}"],
  synchronize: true
});
var database_default = AppDataSource;

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

// src/infrastructure/repositories/Products/ProductRepository.ts
var ProductRepository = database_default.getRepository(ProductDto).extend({
  async findWithColors(productId) {
    const productIdStr = String(productId);
    return "product";
  },
  async createAndSave(productData) {
    const product = this.create(productData);
    const existingProduct = await database_default.createQueryBuilder().select("product").from(ProductDto, "product").where("product.name = :name", { name: product.name }).andWhere("product.seller = :seller", { seller: product.seller_id });
    if (existingProduct) {
      return null;
    }
    return this.save(product);
  },
  async update(id, productData) {
    const updatedProduct = database_default.createQueryBuilder().update(ProductDto).set(productData).where("id = :id", { id }).execute();
    return updatedProduct;
  },
  async findTrendingProducts() {
    return await database_default.createQueryBuilder().select("product").from(ProductDto, "product").orderBy("product.views", "DESC").getMany();
  },
  async findByTags(tag) {
    return await database_default.createQueryBuilder().select("product").from(ProductDto, "product").where("product.tags = :tag", { tag }).getMany();
  },
  async filterProducts(filter) {
    const queryBuilder = database_default.createQueryBuilder().select("product");
    if (filter.upperPrice) {
      queryBuilder.where("product.price < :price", { price: filter.upperPrice });
      queryBuilder.andWhere("product.price > :price", { price: filter.lowerPrice ? filter.lowerPrice : 0 });
    }
    if (filter.category) {
      queryBuilder.andWhere("product.product_category = :category", { category: filter.category });
    }
    if (filter.brand) {
      queryBuilder.andWhere("product.brand = :brand", { brand: filter.brand });
    }
    if (filter.color) {
      queryBuilder.andWhere("product.color = :color", { color: filter.color });
    }
    if (filter.size) {
      queryBuilder.andWhere("product.listed_size = :size", { size: filter.size });
    }
    if (filter.condition) {
      queryBuilder.andWhere("product.condition = :condition", { condition: filter.condition });
    }
    return queryBuilder.getMany();
  }
});
export {
  ProductRepository
};
//# sourceMappingURL=ProductRepository.mjs.map