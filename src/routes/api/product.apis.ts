import express, { Router } from 'express'
import { ProductController } from '../../api/controllers/product.controller'

const router: Router = express.Router()
const productController = new ProductController()

router.get('/', productController.getAllProducts)
router.post('/', productController.addProduct)
router.get('/:id', productController.getSpecificProduct)
router.delete('/:id', productController.deleteProduct)
router.put('/:id', productController.updateProduct)

export default router
