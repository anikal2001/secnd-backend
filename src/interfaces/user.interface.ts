import { Transaction, UpdateResult } from "typeorm";
import { UserPreferences } from "../types/user";
import { Cart } from "../entity/cart.entity";
import { Order } from "../entity/order.entity";
import { ProductInteraction } from "../entity/product_interactions.entity";
import { User } from "../entity/user.entity";

export interface UserInterface {
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  cart: Cart[];
  orders: Order[];
  transactions: Transaction[];
  interactions: ProductInteraction[];
  password: string;
  country: string;
  city: string;
  postalCode: string;
  phone: string;
  avatar: string;
  created_at: number;
  updated_at: number;
  is_seller: boolean;
}

export interface UserRepositoryInterface {
  getUserPreferences(userId: string): Promise<any[]>;
  login(email: string, password: string): Promise<void>;
  makeUserSeller(email: string): Promise<UpdateResult>;
  appwriteUpdateUserPreferences(id: string, preferences: UserPreferences): Promise<boolean>;
  appwriteUpdateUserPassword(id: string, newPassword: string): Promise<boolean>
  appwriteUpdateUserEmail(id: string, email: string): Promise<boolean>
  appwriteUpdateUserName(id: string, name: string): Promise<boolean>
  appwriteGetUserById(id: string): Promise<boolean>
  appwriteGetAllUsers(): Promise<User[]>
  appwriteRemoveUser(id: string): Promise<boolean>
  createUser(user: Partial<User>): Promise<User>;
  update(id: string, user: User): Promise<User>;
  delete(id: string, user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
