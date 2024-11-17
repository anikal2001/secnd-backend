import express from 'express';
import { ProductController } from '../controllers/productController';

export const Router = express.Router();
const productController = new ProductController();

Router.get('/all', productController.fetchProducts);
Router.post('/generate', productController.genProductInfo);
Router.get('/get', productController.getProductById);
Router.delete('/delete', productController.deleteProduct);
Router.put('/update', productController.updateProduct);
Router.get('/filter', productController.filterProducts);
// Router.get('/search', productController.searchProducts);
// Router.get('/categories', productController.getCategories);
Router.get('/categories/:category', productController.getProductsByCategory);
Router.get('/tags/:tag', productController.getProductsByStyle);
Router.get('/trending', productController.getTrendingProducts);
// Router.get('/colors', productController.getColors);
// Router.get('/colors/:color', productController.getProductsByColor);
// Router.get('/sizes', productController.getSizes);
Router.post('/add', productController.addProduct);
