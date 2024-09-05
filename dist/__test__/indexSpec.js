"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/__test__/indexSpec.ts
var import_supertest = __toESM(require("supertest"));

// src/index.ts
var import_express5 = __toESM(require("express"));
var import_reflect_metadata = require("reflect-metadata");
var import_morgan = __toESM(require("morgan"));
var import_helmet = __toESM(require("helmet"));

// src/config.ts
var import_dotenv2 = __toESM(require("dotenv"));

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
  entities: ["src/core/entity/*.ts", __dirname + "/../**/*.entity.{js,ts}"],
  synchronize: true
});
var database_default = AppDataSource;

// src/config.ts
var import_node = require("@shopify/shopify-api/adapters/node");
var import_shopify_api = require("@shopify/shopify-api");
var sdk = require("node-appwrite");
import_dotenv2.default.config();
var { PORT, JWT_SECERT, EXPIRES_IN } = process.env;
var DBconnection = async () => {
  try {
    console.log("Connecting to database2...");
    await database_default.initialize().then(() => {
      console.log("Data Source has been initialized!");
    }).catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });
  } catch (error) {
    console.log(error);
  }
};
var shopifyEnv = {
  apiKey: "3a0bbb6c01530af6e1edbf1243561147",
  apiSecretKey: "a4b2a019f5a630f163def7c77c2e04b3",
  scopes: ["read_products"],
  shopName: "secnd.myshopify.com",
  hostName: "ngrok-tunnel-address",
  apiVersion: import_shopify_api.LATEST_API_VERSION,
  isEmbeddedApp: true
};
var shopify = (0, import_shopify_api.shopifyApi)(shopifyEnv);
var AppwriteClient = new sdk.Client().setEndpoint("https://cloud.appwrite.io/v1").setProject("667a3f9c001646d9ef73").setKey("4670a6679d62b5a75dc7e508821ee7932f83b810f3a33ed32c32f2104efeefe17c93682382c11650a01ba70af93f5c2d4e5afa78cb03c17571d7d4c82e15025281d8a4ab55981d1de30a19b9bf8ab5a841176e2fa341672709c1a7dc2312d5d496dcbf810088e7a69004fec1045d020e87001e92e9c0e58077398418e5baf15a").setSelfSigned();
var config_default = {
  connect: DBconnection,
  port: PORT,
  JWT_SECERT,
  EXPIRES_IN,
  shopify,
  AppwriteClient,
  sdk
};

// src/routes/index.ts
var import_express4 = __toESM(require("express"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// src/routes/api/user.apis.ts
var import_express = __toESM(require("express"));

// src/api/middleware/password.middleware.ts
var import_bcrypt = __toESM(require("bcrypt"));
var hashPassword = async (req, res, next) => {
  const { password } = req.body;
  const salt = await import_bcrypt.default.genSalt(10);
  const hashedPassword = await import_bcrypt.default.hash(password, salt);
  req.body.password = hashedPassword;
  next();
};

// src/api/middleware/user.middleware.ts
var import_express_validator = require("express-validator");
var emailValidations = (email) => {
  return (0, import_express_validator.body)("email").exists().withMessage("Email is required.").isEmail().withMessage("Email is not valid.").isLength({ max: 50 }).withMessage("Email cannot be more than 50 characters long.");
};
var usernameValidations = (username) => {
  return (0, import_express_validator.body)("username").exists().withMessage("Username is required.").isAlphanumeric().isLength({ min: 6 }).withMessage("Username must be at least 3 characters long.").isLength({ max: 24 }).withMessage("Username cannot be more than 50 characters long.");
};
var passwordValidations = (password) => {
  return (0, import_express_validator.body)("password").exists().withMessage("Password is required.").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.").isLength({ max: 50 }).withMessage("Password cannot be more than 50 characters long.").matches(/\d/).withMessage("Password must contain at least one number.").matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character.").matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.").matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.");
};
var validateUserFields = async (req, res, next) => {
  console.log("validating");
  const validations = [
    //@ts-expect-error error1
    emailValidations(),
    //@ts-expect-error error1
    usernameValidations()
    // passwordValidations(req.body.password),
    // addressValidations(req.body.address),
    // cityValidations(req.body.city),
    // postalCodeValidations(req.body.postalCode)
  ];
  for (const validation of validations) {
    const result = await validation.run(req);
    if (!result.isEmpty()) break;
  }
  const errors = (0, import_express_validator.validationResult)(req);
  if (!errors.isEmpty()) {
    return next();
  }
  res.status(500).json({ message: "Validation failed", errors: errors.array()[0].msg });
};

// src/api/decorators/middleware.ts
function Middleware(middleware) {
  console.log("Middleware(): factory evaluated");
  return function(target, propertyKey, descriptor) {
    const middlewares = Reflect.getMetadata("middlewares", target, propertyKey) || [];
    middlewares.push(middleware);
    Reflect.defineMetadata("middlewares", middlewares, target, propertyKey);
  };
}

// src/infrastructure/dto/UserDTO.ts
var UserDto = class {
  user_id;
  firstName;
  lastName;
  email;
  cart;
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
  // Assuming the DTO only needs the order IDs
  transactions;
  // Assuming the DTO only needs the transaction IDs
  interactions;
  // Assuming the DTO only needs the interaction IDs
  isSeller;
  password;
};

// src/infrastructure/repositories/UserRepository.ts
var UserRepository = database_default.getRepository(UserDto).extend({
  findByName(firstName, lastName) {
    return this.createQueryBuilder("user").where("user.firstName = :firstName", { firstName }).andWhere("user.lastName = :lastName", { lastName }).getMany();
  },
  findByEmail(email) {
    return this.createQueryBuilder("user").where("user.email = :email", { email }).getOne();
  },
  findById(id) {
    return this.createQueryBuilder("user").where("user.id = :id", { id }).getOne();
  },
  findByIdandRemove(id) {
    return this.createQueryBuilder("user").delete().from(UserDto).where("user.id = :id", { id }).execute();
  },
  isSeller(email) {
    return this.createQueryBuilder("user").where("user.email = :email", { email }).andWhere("user.isSeller = true").getOne();
  },
  makeSeller(email) {
    return this.createQueryBuilder("user").update(UserDto).set({ isSeller: true }).where("user.email = :email", { email }).execute();
  }
});

// src/infrastructure/services/user.service.ts
var sdk2 = require("node-appwrite");
var UserService = class {
  AppWriteClient;
  Users;
  constructor() {
    const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env;
    this.AppWriteClient = new sdk2.Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY).setSelfSigned();
    this.Users = new sdk2.Users(this.AppWriteClient);
  }
  async createUser(email, password, firstName, lastName, country, city, address, postalCode, phone, avatar) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with the provided email address.");
    }
    const newUser = UserRepository.create({
      email,
      password,
      firstName,
      lastName,
      postalCode,
      phone,
      avatar
    });
    return await UserRepository.save(newUser);
  }
  async getUserPreferences(userId) {
    return await this.Users.getPrefs(userId);
  }
  async sellerLogin(email, password) {
    const isSeller = await UserRepository.isSeller(email);
    if (!isSeller) {
      throw new Error("User is not a seller.");
    }
    const account = new sdk2.Account(this.AppWriteClient);
    const promise = account.createEmailPasswordSession(email, password);
    promise.then(
      (response) => {
        console.log(response);
      }
    ).catch((error) => {
      console.log(error);
    });
  }
  async makeUserSeller(email) {
    return await UserRepository.makeSeller(email);
  }
  async updateUserPreferences(id, preferences) {
    return await this.Users.updatePrefs(id, preferences);
  }
  async updateUserPassword(id, newPassword) {
    return await this.Users.updatePassword(id, newPassword);
  }
  async updateUserEmail(id, email) {
    return await this.Users.updateEmail(id, email);
  }
  async updateUserName(id, name) {
    return await this.Users.updateName(id, name);
  }
  async getUserById(id) {
    return await this.Users.get(id);
  }
  async getAllUsers() {
    return await this.Users.list();
  }
  async removeUser(id) {
    return await this.Users.deleteIdentity(id);
  }
};

// src/core/controllers/Users/UserController.ts
var _UserController = class _UserController {
  static userService = new UserService();
  async createUser(req, res) {
    try {
      const { email, password, firstName, lastName, country, city, address, postalCode, phone, avatar } = req.body;
      const user = await _UserController.userService.createUser(email, password, firstName, lastName, country, city, address, postalCode, phone, avatar);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async getAllUsers(_req, res) {
    console.log(_req);
    try {
      const users = await _UserController.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async sellerLogin(req, res) {
    try {
      const { email, password } = req.body;
      const user = await _UserController.userService.sellerLogin(email, password);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async makeUserSeller(req, res) {
    try {
      const { email } = req.body;
      const user = await _UserController.userService.makeUserSeller(email);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
__decorateClass([
  Middleware(validateUserFields),
  Middleware(hashPassword)
], _UserController.prototype, "createUser", 1);
var UserController = _UserController;
var UserController_default = UserController;

// src/routes/api/user.apis.ts
var router = import_express.default.Router();
var userController = new UserController_default();
router.get("/", userController.getAllUsers);
router.post("/register", passwordValidations, userController.createUser);
router.post("/login", userController.sellerLogin);
router.post("/make-seller", userController.makeUserSeller);
var user_apis_default = router;

// src/routes/api/seller.apis.ts
var import_express2 = __toESM(require("express"));

// src/core/controllers/Sellers/SellerController.ts
var import_class_transformer3 = require("class-transformer");

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
var import_class_transformer2 = require("class-transformer");
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
      const instanceConversion = (0, import_class_transformer2.plainToInstance)(ProductDto, product);
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
      const newSeller = (0, import_class_transformer3.plainToClass)(SellerDTO, req.body);
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

// src/routes/api/seller.apis.ts
var router2 = import_express2.default.Router();
var sellerController = new SellerController();
router2.get("/", sellerController.getAllSellers);
router2.post("/add", sellerController.addSeller);
var seller_apis_default = router2;

// src/routes/api/product.apis.ts
var import_express3 = __toESM(require("express"));

// src/infrastructure/services/product.service.ts
var import_bcrypt2 = __toESM(require("bcrypt"));
var import_class_transformer4 = require("class-transformer");

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
    const newProduct = (0, import_class_transformer4.plainToClass)(ProductDto, productData);
    return await ProductRepository.createAndSave(newProduct);
  }
  async updateProduct(id, productData) {
    const updatedProduct = (0, import_class_transformer4.plainToClass)(ProductDto, productData);
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
    return await import_bcrypt2.default.hashSync(sellerId + productName.toLowerCase(), 10);
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

// src/routes/api/product.apis.ts
var router3 = import_express3.default.Router();
var productController = new ProductController();
router3.get("/get", productController.fetchProducts);
router3.post("/add", productController.addProduct);
router3.get("/:id", productController.getProductById);
router3.delete("/delete", productController.deleteProduct);
router3.put("/:id", productController.updateProduct);
var product_apis_default = router3;

// src/routes/index.ts
var router4 = import_express4.default.Router();
var limiter = (0, import_express_rate_limit.default)({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 30
});
router4.use(limiter);
router4.use("/sellers", seller_apis_default);
router4.use("/users", user_apis_default);
router4.use("/products", product_apis_default);
var routes_default = router4;

// src/api/middleware/error.middleware.ts
var errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Whoops! something went wrong";
  res.status(status).json({ status, message });
};
var error_middleware_default = errorMiddleware;

// src/index.ts
var PORT2 = config_default.port || 8080;
var app = (0, import_express5.default)();
config_default.connect();
app.use(import_express5.default.json());
app.use(import_express5.default.urlencoded({ extended: false }));
app.use((0, import_morgan.default)("dev"));
app.use((0, import_helmet.default)());
app.get("/", (_req, res) => {
  res.json("Hello Server! \u{1F680}");
});
app.use("/api", routes_default);
app.use(error_middleware_default);
app.use((_req, res) => {
  res.status(404).json("Whoops!! You are lost go back to documentation to find your way back to Home again \u{1F602}");
});
app.listen(PORT2, () => {
  console.log(`Server is starting at port:${PORT2}`);
});
var src_default = app;

// src/__test__/indexSpec.ts
var request = (0, import_supertest.default)(src_default);
describe("Test basic endpoint server", () => {
  it("Get the / endpoint", async () => {
    const response = await request.get("/");
    expect(response.status).toBe(200);
  });
});
//# sourceMappingURL=indexSpec.js.map