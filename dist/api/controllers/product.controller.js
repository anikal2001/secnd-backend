"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const tslib_1 = require("tslib");
const product_service_1 = require("../../infrastructure/services/product.service");
class ProductController {
    constructor() {
        this.addProduct = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.productService.createProduct(req.body);
                res.status(201).json(product);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
        this.getAllProducts = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield this.productService.getAllProducts();
                res.json(products);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        this.getSpecificProduct = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.productService.getProductById(req.params.id);
                if (product) {
                    res.json(product);
                }
                else {
                    res.status(404).json({ message: 'Product not found' });
                }
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        this.getProductById = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.productService.getProductById(req.params.id);
                if (product) {
                    res.json(product);
                }
                else {
                    res.status(404).json({ message: 'Product not found' });
                }
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        this.createProduct = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.productService.createProduct(req.body);
                res.status(201).json(product);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
        this.updateProduct = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const updatedProduct = yield this.productService.updateProduct(req.params.id, req.body);
                if (updatedProduct) {
                    res.json(updatedProduct);
                }
                else {
                    res.status(404).json({ message: 'Product not found' });
                }
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        this.deleteProduct = (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.productService.deleteProduct(req.params.id);
                if (result) {
                    res.status(204).send();
                }
                else {
                    res.status(404).json({ message: 'Product not found' });
                }
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        this.productService = new product_service_1.ProductService();
    }
}
exports.ProductController = ProductController;
