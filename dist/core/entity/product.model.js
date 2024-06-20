"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const products_enums_1 = require("../../utils/products.enums");
let Product = class Product extends typeorm_1.BaseEntity {
};
exports.Product = Product;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('float'),
    tslib_1.__metadata("design:type", Number)
], Product.prototype, "price", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: products_enums_1.ProductColors,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "colors", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "size", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "category", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "condition", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: products_enums_1.ProductTags,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "brand", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "material", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "gender", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "seller", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('simple-array'),
    tslib_1.__metadata("design:type", Array)
], Product.prototype, "imageUrls", void 0);
exports.Product = Product = tslib_1.__decorate([
    (0, typeorm_1.Entity)({ name: 'products_table' })
], Product);
