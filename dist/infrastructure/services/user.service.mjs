var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

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
export {
  UserService
};
//# sourceMappingURL=user.service.mjs.map