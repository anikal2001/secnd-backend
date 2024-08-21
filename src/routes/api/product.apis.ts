import express, { Router } from 'express';
// import { ProductController } from '../../api/controllers/product.controller';
import { ProductController } from '../../core/controllers/Products/ProductController';
import { validateProductFields } from '../../api/middleware/products.middleware';

const router: Router = express.Router();
const productController = new ProductController();

router.get('/get', productController.fetchProducts);
router.post('/add', productController.addProduct);
router.get('/:id', productController.getProductById);
router.delete('/delete', productController.deleteProduct);
router.put('/:id', productController.updateProduct);

export default router;
