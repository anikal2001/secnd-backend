import {AppDataSource} from '../database/config';
import { encrypt } from '../helpers/encrypt';
import { UserService } from '../services/user.service';
import { Request, Response } from 'express';
import { UserInterface } from '../interfaces/user.interface';
import { User } from '../entity/user.entity';
import { Cart } from '../entity/cart.entity';


class UserController {
    public static userService: UserService = new UserService();

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, first_name, last_name, country, city, postalCode, phone, avatar }: UserInterface = req.body;
            const created_at = new Date().getDate();
            const updated_at = new Date().getDate();
            const is_seller = false;
            const reset_token = '';
            const expiry_token = new Date().getUTCSeconds();
            const cart: Cart[] = []
            const newUser: UserInterface = { email, password, first_name, last_name, country, city, postalCode, phone, avatar, created_at, updated_at, is_seller, reset_token, expiry_token, cart: cart, orders: [], transactions: [], interactions: [] };
            const user = await UserController.userService.createUser(newUser);
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
