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

// src/config.ts
var config_exports = {};
__export(config_exports, {
  default: () => config_default
});
module.exports = __toCommonJS(config_exports);
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
//# sourceMappingURL=config.js.map