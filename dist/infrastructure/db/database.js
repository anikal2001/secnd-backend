"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const user_model_1 = require("../../core/entity/user.model");
const product_model_1 = require("../../core/entity/product.model");
dotenv_1.default.config();
const { PGHOST, PGDATABASE, PGPASSWORD, PGUSER, ENDPOINT_ID } = process.env;
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: PGHOST,
    port: 5432,
    username: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
    ssl: true,
    logging: true,
    entities: [
        'src/core/entity/*.ts',
        __dirname + '/../**/*.entity.{js,ts}',
        user_model_1.User,
        product_model_1.Product
    ],
    synchronize: true,
});
exports.default = AppDataSource;
