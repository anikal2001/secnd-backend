import express, { Router } from 'express';
// import { UserController } from '../../api/controllers/user.controller';
import UserController from '../../core/controllers/Users/UserController';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { validateUserFields, passwordValidations } from '../../api/middleware/user.middleware';
const router: Router = express.Router();

const userController = new UserController(UserRepository);

router.get('/', userController.getAllUsers);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/:id', userController.updateUser);
router.put('/change-password/:id', userController.changePassword);

export default router;
