"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const tslib_1 = require("tslib");
const ProductRepository_1 = require("../repositories/ProductRepository");
class ProductService {
    getAllProducts() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield ProductRepository_1.ProductRepository.find();
        });
    }
    getProductById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield ProductRepository_1.ProductRepository.findOne({ where: { id } });
        });
    }
    createProduct(productData) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const product = ProductRepository_1.ProductRepository.create(productData);
            yield ProductRepository_1.ProductRepository.insert(product);
            return product;
        });
    }
    updateProduct(id, productData) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const product = yield ProductRepository_1.ProductRepository.findOne({ where: { id } });
            if (!product)
                return null;
            product.name = productData.name;
            product.description = productData.description;
            product.price = productData.price;
            yield ProductRepository_1.ProductRepository.insert(product);
            return product;
        });
    }
    deleteProduct(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const deleteResult = yield ProductRepository_1.ProductRepository.delete(id);
            return ((_a = deleteResult.affected) !== null && _a !== void 0 ? _a : 0) > 0 ? false : true;
        });
    }
}
exports.ProductService = ProductService;
