import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, NODE_ENV } = process.env;
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
  synchronize: true,
  logging: true,
});

console.log(__dirname + "/../**/*.entity{.ts,.js}")
