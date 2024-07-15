import { User } from '../../entity/user.model';
import AppDataSource from '../../../infrastructure/db/database';
import { hashPassword } from '../../../api/middleware/password.middleware';
import { validateUserFields } from '../../../api/middleware/user.middleware';
import { Middleware } from '../../../api/decorators/middleware';
import { Request, Response } from 'express';
import { UserType } from '../../../types/user';


class UserController {
  private userService;
  // TODO: Update type according to typeorm
  constructor(userService: any) {
    this.userService = userService;
  }
  @Middleware(validateUserFields)
  @Middleware(hashPassword)
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, country, city, address, postalCode, phone, avatar }: UserType = req.body;
      const user = await this.userService.createUser(email, password, firstName, lastName, country, city, address, postalCode, phone, avatar);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  } 
  async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default UserController;
