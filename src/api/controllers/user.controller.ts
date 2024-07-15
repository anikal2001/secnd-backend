import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../infrastructure/services/user.service';
import { UserType } from '../../types/user';
import { Get, Post } from '../decorators/methods';
import { Middleware } from '../decorators/middleware';
import { validateUserFields } from '../middleware/user.middleware';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // @Middleware(validateUserFields)
  // @Post('/users')
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, country, city, address, postalCode, phone, avatar }: UserType = req.body;
      const user = await this.userService.createUser(email, password, firstName, lastName, country, city, address, postalCode, phone, avatar);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
  public getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedUser = await this.userService.updateUser(Number(req.params.id), req.body);
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
  public loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const token = await this.userService.authenticateUser(email, password);
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
  public changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const id = Number(req.params.id);
      const message = await this.userService.changePassword(id, currentPassword, newPassword, confirmPassword);
      res.json({ message });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}

// const createUser = async (req: Request, res: Response) => {
//   try {
//     const user = new User()
//     const email = req.body.email
//     const ChkUser = await User.findBy({
//       email: email,
//     })

//     if (ChkUser) return res.status(400).json('user already exists')

//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(req.body.password, salt)
//     user.password = hashedPassword
//     user.email = email
//     user.firstName = req.body.firstName
//     user.lastName = req.body.lastName
//     user.country = req.body.country
//     user.city = req.body.city
//     user.address = req.body.address
//     user.postalCode = req.body.postalCode
//     user.phone = req.body.phone
//     if (req.body.avatar) user.avatar = req.body.avatar
//     else user.avatar = ''

//     await user.save()

//     const token = jwt.sign({ _id: user }, config.JWT_SECERT as string, {
//       expiresIn: config.EXPIRES_IN,
//     })

//     res.header('x-auth-header', token)

//     res.status(200).json('user added successfully')
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error: ', err })
//   }
// }

// const authUser = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body

//     const user = (await User.findBy({ email: email })) as any

//     if (!user) return res.status(404).json('user credentionals')

//     if (!bcrypt.compareSync(password, user.password))
//       return res.status(404).json('Wrong credentionals')

//     const token = jwt.sign({ _id: user }, config.JWT_SECERT as string, {
//       expiresIn: config.EXPIRES_IN,
//     })

//     res.header('x-auth-header', token)
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error: ', err })
//   }
// }
