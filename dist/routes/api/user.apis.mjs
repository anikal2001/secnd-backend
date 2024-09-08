var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/routes/api/user.apis.ts
import express from "express";

// src/api/middleware/password.middleware.ts
import bcrypt from "bcrypt";
var hashPassword = async (req, res, next) => {
  const { password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  req.body.password = hashedPassword;
  next();
};

// src/api/middleware/user.middleware.ts
import { body, validationResult } from "express-validator";
var emailValidations = (email) => {
  return body("email").exists().withMessage("Email is required.").isEmail().withMessage("Email is not valid.").isLength({ max: 50 }).withMessage("Email cannot be more than 50 characters long.");
};
var usernameValidations = (username) => {
  return body("username").exists().withMessage("Username is required.").isAlphanumeric().isLength({ min: 6 }).withMessage("Username must be at least 3 characters long.").isLength({ max: 24 }).withMessage("Username cannot be more than 50 characters long.");
};
var passwordValidations = (password) => {
  return body("password").exists().withMessage("Password is required.").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.").isLength({ max: 50 }).withMessage("Password cannot be more than 50 characters long.").matches(/\d/).withMessage("Password must contain at least one number.").matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character.").matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.").matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.");
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
  const errors = validationResult(req);
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
var sdk = __require("node-appwrite");
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
var router = express.Router();
var userController = new UserController_default();
router.get("/", userController.getAllUsers);
router.post("/register", passwordValidations, userController.createUser);
router.post("/login", userController.sellerLogin);
router.post("/make-seller", userController.makeUserSeller);
var user_apis_default = router;
export {
  user_apis_default as default
};
//# sourceMappingURL=user.apis.mjs.map