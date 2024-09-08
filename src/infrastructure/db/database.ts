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
  entities: [__dirname + '/../../core/entity/*.model.{ts, js, mjs}'],
  synchronize: true,
  cache: false,
});


export default AppDataSource;
