"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const product_model_1 = require("../../entity/product.model");
const database_1 = tslib_1.__importDefault(require("../../../infrastructure/db/database"));
class ListProducts {
    execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const productRepository = database_1.default.getRepository(product_model_1.Product);
            return productRepository.find();
        });
    }
}
exports.default = ListProducts;
