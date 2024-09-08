var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/config.ts
import dotenv2 from "dotenv";

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

// src/config.ts
var sdk = __require("node-appwrite");
dotenv2.config();
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
var AppwriteClient = new sdk.Client().setEndpoint("https://cloud.appwrite.io/v1").setProject("667a3f9c001646d9ef73").setKey("4670a6679d62b5a75dc7e508821ee7932f83b810f3a33ed32c32f2104efeefe17c93682382c11650a01ba70af93f5c2d4e5afa78cb03c17571d7d4c82e15025281d8a4ab55981d1de30a19b9bf8ab5a841176e2fa341672709c1a7dc2312d5d496dcbf810088e7a69004fec1045d020e87001e92e9c0e58077398418e5baf15a").setSelfSigned();
var config_default = {
  connect: DBconnection,
  port: PORT,
  JWT_SECERT,
  EXPIRES_IN,
  AppwriteClient,
  sdk
};
export {
  config_default as default
};
//# sourceMappingURL=config.mjs.map