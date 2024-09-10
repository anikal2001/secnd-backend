import express from 'express';
import {SellerController} from '../controllers/SellerController';
export const Router = express.Router();

const sellerController = new SellerController();

Router.get('/', sellerController.getAllSellers);
Router.post('/add', sellerController.addSeller);

