"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class CreateProduct {
    // TODO: Update type according to typeorm
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    execute(createProductRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const newProduct = this.productRepository.create(createProductRequest);
            yield this.productRepository.save(newProduct);
            return newProduct;
        });
    }
}
exports.default = CreateProduct;
