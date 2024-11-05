import {AppDataSource} from '../database/config';
import { encrypt } from '../helpers/encrypt';
import { UserService } from '../services/user.service';
import { Request, Response } from 'express';
import { UserInterface } from '../interfaces/user.interface';
import { User } from '../entity/user.entity';
import { Cart } from '../entity/cart.entity';
import { UserRepository } from '../repositories/user.repository';


class UserController {
    public static userService: UserService = new UserService();

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, first_name, last_name, country, city, postalCode, phone, avatar }: UserInterface = req.body;
          const newUser: Partial<User> = { email, password, first_name, last_name, country, city, postalCode, phone, avatar, orders: [], transactions: [], interactions: [] };
            const user = await UserController.userService.createUser(newUser);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
  } 
  
  async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await UserController.userService.appwriteGetAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const session = await UserController.userService.login(email, password);
      res.cookie('session', session.secret, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: session.expire,
        path: '/'
      });
      res.status(200).json({success: true});
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async makeUserSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body;
      const user = await UserController.userService.makeUserSeller(id);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }


  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body;
      const user = await UserController.userService.appwriteFindById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      } else {
        const deletedUser = await UserController.userService.delete(id, user);
        res.status(200).json(deletedUser);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  async listSessions(req: Request, res: Response): Promise<void> {
    const { id } = req.body;
    try {
      const sessions = await UserController.userService.listSessions(id);
      res.status(200).json(sessions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    const { id, sessionId } = req.body;
    try {
      const session = await UserController.userService.appwriteDeleteSession(id, sessionId)
      res.status(200).json(session)
    } catch (error: any) {
      res.status(400).json({message: error.message})
    }
  }
}

export default UserController;
