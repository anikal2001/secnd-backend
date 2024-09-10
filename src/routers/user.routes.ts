import express from "express";
export const Router = express.Router();
import UserController from "../controllers/userController";
const userController = new UserController();

Router.get("/get-users", userController.getAllUsers);
Router.post("/seller-login", userController.sellerLogin);
// Router.post("/login", userController.login);
// Router.get("/user/:id", userController.findById);
// Router.get("/user/:email", userController.findByEmail);
// Router.put("/user/:id", userController.update);
// Router.delete("/user/:id", userController.delete);
