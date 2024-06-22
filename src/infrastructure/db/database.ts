import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../../core/entity/user.model';
import { Product } from '../../core/entity/product.model';
dotenv.config();

const { PGHOST, PGDATABASE, PGPASSWORD, PGUSER, ENDPOINT_ID } = process.env;
const AppDataSource = new DataSource({
  type: 'postgres',
  host: PGHOST,
  port: 5432,
  username: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  ssl: true,
  logging: true,
  entities: ['src/core/entity/*.ts', __dirname + '/../**/*.entity.{js,ts}', User, Product],
  synchronize: true,
});

export default AppDataSource;
