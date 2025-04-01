import express from 'express';
import { ProductController } from '../controllers/productController';

export const Router = express.Router();
const productController = new ProductController();

Router.get('/all', productController.fetchProducts);
Router.post('/generate', productController.genProductInfo);
Router.post('/add', productController.addProduct);

Router.get('/get', productController.getProductById);
Router.delete('/delete', productController.deleteProduct);
Router.delete('/delete-multiple', productController.deleteMultipleProducts);
Router.post('/update', productController.updateProduct);
Router.get('/filter', productController.filterProducts);
Router.post('/save-draft', productController.saveDraft);
Router.post('/upload-image', productController.uploadImage);
Router.post('/import', productController.importProducts);
// Router.get('/search', productController.searchProducts);
// Router.get('/categories', productController.getCategories);
Router.get('/categories/:category', productController.getProductsByCategory);
// Router.get('/tags/:tag', productController.getProductsByStyle);
Router.get('/trending', productController.getTrendingProducts);
// Router.get('/colors', productController.getColors);
// Router.get('/colors/:color', productController.getProductsByColor);
// Router.get('/sizes', productController.getSizes);
Router.post('/picture', productController.uploadImage)
Router.post('/inference', productController.inferenceImages)

Router.post('/delist', productController.delistMarketplaceListing)
Router.post('/delete-marketplace', productController.deleteMarketplaceListing)
Router.get('/get-other-marketplace-listings', productController.getOtherMarketplaceListings)

