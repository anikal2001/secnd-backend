import express from 'express';
import { ProductController } from '../controllers/productController';

export const Router = express.Router();
const productController = new ProductController();

Router.get('/get', productController.fetchProducts);
Router.post('/add', productController.addProduct);
Router.get('/:id', productController.getProductById);
Router.delete('/delete', productController.deleteProduct);
Router.put('/:id', productController.updateProduct);
