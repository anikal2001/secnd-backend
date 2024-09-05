import AppDataSource from '../../../infrastructure/db/database';
import { hashPassword } from '../../../api/middleware/password.middleware';
import { validateUserFields } from '../../../api/middleware/user.middleware';
import { Middleware } from '../../../api/decorators/middleware';
import { UserService } from '../../../infrastructure/services/user.service';
import { Request, Response } from 'express';
import { UserType } from '../../../types/user';


class UserController {
  public static userService = new UserService();


  @Middleware(validateUserFields)
  @Middleware(hashPassword)
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, country, city, address, postalCode, phone, avatar }: UserType = req.body;
      const user = await UserController.userService.createUser(email, password, firstName, lastName, country, city, address, postalCode, phone, avatar);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } 
  async getAllUsers(_req: Request, res: Response): Promise<void> {
    console.log(_req)
    try {
      const users = await UserController.userService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async sellerLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await UserController.userService.sellerLogin(email, password);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async makeUserSeller(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const user = await UserController.userService.makeUserSeller(email);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default UserController;
