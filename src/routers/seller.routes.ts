import express from 'express';
import { SellerController } from '../controllers/sellerController';
export const Router = express.Router();

const sellerController = new SellerController();

Router.get('/', sellerController.getAllSellers);
Router.post('/add', sellerController.addSeller);
Router.get('/:id', sellerController.getSellerById);
Router.get('/:id/products', sellerController.getSellerProducts);
Router.get('/:id/products/:productId', sellerController.getSellerProductById);
Router.get('/:id/trending-products', sellerController.getTrendingProducts);
Router.delete('/:id', sellerController.deleteSeller);
Router.put('/:id', sellerController.updateSeller);
Router.get('/:id/products/:productId/interactions', sellerController.getProductInteractions);

// Statistics
Router.get('/revenues/:id', sellerController.getSellerRevenues);
Router.get('/orders/:id', sellerController.getSellerOrders);
Router.get('/customers/:id', sellerController.getSellerCustomers);
