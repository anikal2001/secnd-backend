import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, DB_NAME, NODE_ENV } = process.env;
export const AppDataSource = new DataSource({
  type: "postgres",
  host: PGHOST,
  port: 5432,
  username: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  ssl: true,
  // ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : true,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: NODE_ENV === "development" ? true : false,
  logging: NODE_ENV === "development" ? true : false,
});

console.log(__dirname + "/../**/*.entity{.ts,.js}")
