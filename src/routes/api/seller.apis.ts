import express, { Router } from 'express';
import {SellerController} from '../../core/controllers/Sellers/SellerController';
import { validateUserFields, passwordValidations } from '../../api/middleware/user.middleware';
const router: Router = express.Router();

const sellerController = new SellerController();

router.post('/add', sellerController.addSeller);

export default router;
