"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const tslib_1 = require("tslib");
const database_1 = tslib_1.__importDefault(require("../db/database"));
const product_model_1 = require("../../core/entity/product.model");
exports.ProductRepository = database_1.default.getRepository(product_model_1.Product).extend({
    findWithColors(productId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const productIdStr = String(productId);
            const product = this.findOne({ where: { id: productIdStr }, relations: ['colors'] });
            return product;
        });
    },
});
