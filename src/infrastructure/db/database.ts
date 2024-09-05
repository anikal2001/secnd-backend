import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
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
  entities: ['src/core/entity/*.ts', __dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
});

export default AppDataSource;
