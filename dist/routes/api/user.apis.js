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

// src/routes/api/user.apis.ts
var user_apis_exports = {};
__export(user_apis_exports, {
  default: () => user_apis_default
});
module.exports = __toCommonJS(user_apis_exports);
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
var sdk = require("node-appwrite");
var UserService = class {
  AppWriteClient;
  Users;
  constructor() {
    const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env;
    this.AppWriteClient = new sdk.Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY).setSelfSigned();
    this.Users = new sdk.Users(this.AppWriteClient);
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
    const account = new sdk.Account(this.AppWriteClient);
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
//# sourceMappingURL=user.apis.js.map