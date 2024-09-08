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

// src/infrastructure/services/user.service.ts
var user_service_exports = {};
__export(user_service_exports, {
  UserService: () => UserService
});
module.exports = __toCommonJS(user_service_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UserService
});
//# sourceMappingURL=user.service.js.map