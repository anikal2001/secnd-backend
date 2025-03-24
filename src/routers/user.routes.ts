import express from "express";
import UserController from "../controllers/userController";

export const Router = express.Router();
const userController = new UserController();

Router.get("/get-users", userController.getAllUsers);
Router.get("/list-user-sessions", userController.listSessions);
Router.post("/login", userController.login);
Router.post("/make-seller", userController.makeUserSeller);
Router.post("/create-user", userController.createUser);
Router.delete("/delete", userController.delete);
Router.delete("/delete-session", userController.deleteSession)
// Router.post("/login", userController.login);
// Router.get("/user/:id", userController.findById);
// Router.get("/user/:email", userController.findByEmail);
// Router.put("/user/:id", userController.update);
// Router.delete("/user/:id", userController.delete);
