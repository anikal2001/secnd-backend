"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const products_enums_1 = require("../../utils/products.enums");
const product_model_1 = require("./product.model");
let Colors = class Colors {
};
exports.Colors = Colors;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    tslib_1.__metadata("design:type", Number)
], Colors.prototype, "productId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: products_enums_1.ProductColors,
        array: true
    }),
    tslib_1.__metadata("design:type", Array)
], Colors.prototype, "colors", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => product_model_1.Product, product => product.colors),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    tslib_1.__metadata("design:type", product_model_1.Product)
], Colors.prototype, "product", void 0);
exports.Colors = Colors = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], Colors);
