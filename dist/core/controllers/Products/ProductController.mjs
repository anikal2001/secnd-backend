// src/infrastructure/services/product.service.ts
import bcrypt from "bcrypt";
import { plainToClass } from "class-transformer";

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
  synchronize: true,
  cache: false
});
console.log("DATABASE CONNECTION: ", __dirname + "core/entity/*.model.js");
var database_default = AppDataSource;

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

// src/infrastructure/services/product.service.ts
var ProductService = class {
  // Get Methods
  async fetchProducts() {
    return await ProductRepository.find();
  }
  async getTrendingProducts() {
    const trendingProducts = await ProductRepository.findTrendingProducts();
    return trendingProducts;
  }
  async getProductsByCategory(category) {
    if (category in ProductCategory) {
      throw new Error("Invalid category");
    }
    const categoryKey = category;
    const products = await ProductRepository.findBy({ product_category: ProductCategory[categoryKey] });
    if (!products) {
      return [];
    }
    return products;
  }
  async getProductsByStyle(tag) {
    if (tag in ProductCategory) {
      throw new Error("Invalid category");
    }
    const tagKey = tag;
    const products = await ProductRepository.findByTags(tagKey);
    if (!products) {
      return [];
    }
    return products;
  }
  async filterProducts(filter) {
    const products = await ProductRepository.filterProducts(filter);
    if (!products) {
      return [];
    }
    return products;
  }
  async getProductById(id) {
    const product = await ProductRepository.findOneBy({ product_id: id });
    if (!product) {
      return null;
    }
    return product;
  }
  // Post Methods
  async createProduct(productData) {
    productData.product_id = await this._genProductId(productData.seller.toString(), productData.name);
    const newProduct = plainToClass(ProductDto, productData);
    return await ProductRepository.createAndSave(newProduct);
  }
  async updateProduct(id, productData) {
    const updatedProduct = plainToClass(ProductDto, productData);
    const UpdateResult = await ProductRepository.update(id, updatedProduct);
    if (UpdateResult.affected === 0) {
      return false;
    } else {
      return true;
    }
  }
  async deleteProduct(id) {
    const product = await ProductRepository.findOneBy({ product_id: id });
    if (!product) {
      return false;
    }
    const deletedProduct = await ProductRepository.remove(product);
    if (!deletedProduct) {
      throw new Error("Failed to delete product");
    }
    return true;
  }
  // Private Methods
  async _genProductId(sellerId, productName) {
    return await bcrypt.hashSync(sellerId + productName.toLowerCase(), 10);
  }
  // _genProductUpdateInput(product: ProductType): any {
  // }
  // _genProductAddInput(product: ProductType): any {
  //   if (product.imageUrls && product.imageUrls.length === 0) {
  //     throw new Error('Product must have at least one image');
  //   }
  //   const colors = {
  //     PrimaryColor: product.primaryColors,
  //     SecondaryColor: product.secondaryColors,
  //   };
  //   const media = product.imageUrls.map((url) => {
  //     return {
  //       originalSource: url,
  //       alt: product.name,
  //       mediaContentType: 'IMAGE',
  //     };
  //   });
  //   const ProductAddSchema = {
  //     input: {
  //       title: product.name,
  //       descriptionHtml: product.description,
  //       category: 'gid://shopify/TaxonomyCategory/aa-1-1-7-5',
  //       tags: product.tags,
  //       vendor: product.seller,
  //       seo: {
  //         title: product.name,
  //         description: product.description,
  //       },
  //       productType: product.category,
  //       metafields: [
  //         {
  //           namespace: 'custom',
  //           key: 'condition',
  //           value: product.condition,
  //           type: 'single_line_text_field',
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'size',
  //           value: product.size,
  //           type: 'single_line_text_field'
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'material',
  //           value: product.material.toString(),
  //           type: 'single_line_text_field'
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'gender',
  //           value: product.gender,
  //           type: 'single_line_text_field',
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'brand',
  //           value: product.brand,
  //           type: 'single_line_text_field',
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'color',
  //           value: JSON.stringify(colors),
  //           type: 'json',
  //         },
  //       ],
  //     },
  //     media: media,
  //   };
  //   return ProductAddSchema;
  // }
};

// src/core/controllers/Products/ProductController.ts
var ProductController = class _ProductController {
  static productService = new ProductService();
  addProduct = async (req, res) => {
    try {
      if (!req.body) {
        res.status(400).json({ message: "Request body is required" });
        return;
      }
      const product = await _ProductController.productService.createProduct(req.body);
      if (!product) {
        res.status(400).json({ message: "Product already exists" });
        return;
      }
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  async fetchProducts(req, res) {
    try {
      const products = await _ProductController.productService.fetchProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  getProductById = async (req, res) => {
    try {
      const product = await _ProductController.productService.getProductById(req.params.id);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  updateProduct = async (req, res) => {
    try {
      const updatedProduct = await _ProductController.productService.updateProduct(req.params.id, req.body);
      if (updatedProduct) {
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  deleteProduct = async (req, res) => {
    try {
      const result = await _ProductController.productService.deleteProduct(req.body.id);
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  // Current Products that have the most wishlist + likes + views
  getTrendingProducts = async (req, res) => {
    try {
      const topProducts = await _ProductController.productService.getTrendingProducts();
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  getProductsByStyle = async (req, res) => {
    try {
      const products = await _ProductController.productService.getProductsByStyle(req.params.style);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  getProductsByCategory = async (req, res) => {
    try {
      const products = await _ProductController.productService.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  filterProducts = async (req, res) => {
    try {
      const products = await _ProductController.productService.filterProducts(req.body);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
export {
  ProductController
};
//# sourceMappingURL=ProductController.mjs.map