import express from 'express';
import { CartController } from '../controllers/cartController';

export const Router = express.Router();
const cartController = new CartController();

Router.get("/get/:userId", cartController.getCart);

Router.post("/add/:userId", cartController.addToCart);

Router.delete("/remove/:userId/:productId", cartController.removeFromCart);

Router.delete("/clear/:userId", cartController.clearCart);

Router.get("/total/:userId/", cartController.getCartTotal);

Router.patch("/status/:cartId/", cartController.updateCartStatus);
