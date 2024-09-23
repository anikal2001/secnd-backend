import express from "express";

export const Router = express.Router();


import CartController from "../controllers/cartController";

const cartController = new CartController();

Router.get("/get-users", cartController.getCart);
Router.post("/add", cartController.addToCart);
Router.delete("/delete", cartController.deleteFromCart);
Router.get("/total", cartController.getCartTotal);
