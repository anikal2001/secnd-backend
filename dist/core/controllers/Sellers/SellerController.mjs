// src/core/controllers/Sellers/SellerController.ts
import { plainToClass as plainToClass2 } from "class-transformer";

// src/infrastructure/dto/SellerDTO.ts
var SellerDTO = class {
  seller_id;
  email;
  store_name;
  store_description;
  store_logo;
  products;
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

// src/infrastructure/services/seller.service.ts
import { plainToInstance as plainToInstance2 } from "class-transformer";
var SellerService = class {
  async createSeller(createSellerDto) {
    const sellerData = {
      email: createSellerDto.email,
      store_name: createSellerDto.store_name,
      store_description: createSellerDto.store_description,
      store_logo: createSellerDto.store_logo
    };
    return await SellerRepository.save(sellerData);
  }
  async fetchSellers() {
    return await SellerRepository.find();
  }
  async getSellerById(sellerId) {
    return await SellerRepository.findOneBy({ seller_id: sellerId });
  }
  async getSellerProducts(sellerId) {
    return await SellerRepository.getSellerProducts(sellerId);
  }
  async updateSeller(sellerId, updatedSeller) {
    const seller = await SellerRepository.findOneBy({ seller_id: sellerId });
    database_default.createQueryBuilder().update(SellerDTO).set(updatedSeller).where("seller_id = :seller_id", { seller_id: sellerId }).execute();
    return null;
  }
  async deleteSeller(sellerId) {
    const seller = await SellerRepository.findOneBy({ seller_id: sellerId });
    if (seller) {
      await database_default.createQueryBuilder().delete().from(SellerDTO).where("seller_id = :seller_id", { sellerId }).execute();
    }
    return false;
  }
  async getTrendingProducts(sellerID) {
    const trendingProducts = await ProductRepository.createQueryBuilder("product").leftJoinAndSelect("product.interactions", "interaction").where("interaction.interaction_date >= :startDate", { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3) }).andWhere("product.sellerId = :sellerId", { sellerID }).select("product.product_id", "product_id").addSelect("product.name", "name").addSelect("COUNT(interaction.interaction_id)", "interaction_count").groupBy("product.product_id").orderBy("interaction_count", "DESC").limit(10).getRawMany();
    const productDTO = trendingProducts.map((product) => {
      const instanceConversion = plainToInstance2(ProductDto, product);
      return instanceConversion;
    });
    return productDTO;
  }
  // TODO: Implement the following methods
  async getSellerRevenues(sellerId) {
    return null;
  }
  async getSellerOrders(sellerId) {
    return null;
  }
  async getTopSellers() {
    return null;
  }
  async getTrendingSellers() {
    return null;
  }
};

// src/core/controllers/Sellers/SellerController.ts
var SellerController = class _SellerController {
  static sellerService = new SellerService();
  getAllSellers = async (req, res) => {
    try {
      const sellers = await _SellerController.sellerService.fetchSellers();
      res.json(sellers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  addSeller = async (req, res) => {
    try {
      if (!req.body) {
        res.status(400).json({ message: "Request body is required" });
        return;
      }
      const newSeller = plainToClass2(SellerDTO, req.body);
      const seller = await _SellerController.sellerService.createSeller(newSeller);
      res.status(201).json(seller);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  getSellerById = async (req, res) => {
    try {
      const seller = await _SellerController.sellerService.getSellerById(Number(req.params.id));
      if (seller) {
        res.json(seller);
      } else {
        res.status(404).json({ message: "Seller not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  getSellerProducts = async (req, res) => {
    try {
      const products = await _SellerController.sellerService.getSellerProducts(Number(req.params.id));
      if (products) {
        res.json(products);
      } else {
        res.status(404).json({ message: "Seller not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  getSellerRevenues = async (req, res) => {
    try {
      const sellerID = Number(req.params.id);
      const revenues = await _SellerController.sellerService.getSellerRevenues(sellerID);
      if (revenues) {
        res.json(revenues);
      } else {
        res.status(404).json({ message: "Seller not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  getSellerOrders = async (req, res) => {
    try {
      const sellerID = Number(req.params.id);
      const orders = await _SellerController.sellerService.getSellerOrders(sellerID);
      if (orders) {
        res.json(orders);
      } else {
        res.status(404).json({ message: "Seller not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  updateSeller = async (req, res) => {
    try {
      const sellerId = Number(req.params.id);
      const updatedSeller = await _SellerController.sellerService.updateSeller(sellerId, req.body);
      if (updatedSeller) {
        res.json(updatedSeller);
      } else {
        res.status(404).json({ message: "Seller not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  deleteSeller = async (req, res) => {
    try {
      const result = await _SellerController.sellerService.deleteSeller(req.body.id);
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(404).json({ message: "Seller not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  getTrendingSellers = async (req, res) => {
    try {
      const trendingSellers = await _SellerController.sellerService.getTrendingSellers();
      if (trendingSellers) {
        res.json(trendingSellers);
      } else {
        res.status(404).json({ message: "No trending sellers found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  getTopSellers = async (req, res) => {
    try {
      const topSellers = await _SellerController.sellerService.getTopSellers();
      if (topSellers) {
        res.json(topSellers);
      } else {
        res.status(404).json({ message: "No top sellers found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  getTrendingProductsForSeller = async (req, res) => {
    try {
      const sellerID = Number(req.params.id);
      const trendingProducts = await _SellerController.sellerService.getTrendingProducts(sellerID);
      if (trendingProducts) {
        res.json(trendingProducts);
      } else {
        res.status(404).json({ message: "No trending products found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
export {
  SellerController
};
//# sourceMappingURL=SellerController.mjs.map