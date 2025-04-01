import express from 'express';
import { OrderController } from '../controllers/orderController';

export const Router = express.Router();
const orderController = new OrderController();

// Basic order management routes
Router.get('/all', orderController.getOrders);
Router.get('/search', orderController.searchOrders);
Router.get('/:id', orderController.getOrderById);
Router.get('/product/:productId', orderController.getOrdersByProduct);
Router.get('/seller/:sellerId', orderController.getSellerOrders);
Router.put('/:id/shipping', orderController.updateShipping);
Router.put('/:id/mark-shipped', orderController.markAsShipped);
Router.post('/create', orderController.createOrder);
Router.get('/status/counts', orderController.getOrderStatusCounts);

// Analytics routes
Router.get('/analytics/overview', orderController.getAnalyticsOverview);
Router.get('/analytics/stats', orderController.getOrderStats);
Router.get('/analytics/categories', orderController.getCategoryStats);
Router.get('/analytics/revenue/monthly', orderController.getMonthlyRevenue);
Router.get('/analytics/revenue/daily', orderController.getDailyRevenue);
Router.get('/analytics/products/top', orderController.getTopSellingProducts);
Router.get('/analytics/inventory/turnover', orderController.getInventoryTurnover);
Router.get('/analytics/marketplace/performance', orderController.getMarketplacePerformance);
Router.get('/analytics/seller/:sellerId/summary', orderController.getSellerSalesSummary);

export default Router;