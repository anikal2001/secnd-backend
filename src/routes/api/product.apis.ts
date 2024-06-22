import express, { Router } from 'express';
import { ProductController } from '../../api/controllers/product.controller';
import { validateProductFields } from '../../api/middleware/products.middleware';
const router: Router = express.Router();
const productController = new ProductController();

router.get('/get', productController.getAllProducts);
router.post('/add', validateProductFields, productController.addProduct);
router.get('/:id', productController.getSpecificProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id', productController.updateProduct);

export default router;
