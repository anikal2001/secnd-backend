import { Transaction, UpdateResult } from "typeorm";
import { UserPreferences } from "../types/user";
import { Cart } from "../entity/cart.entity";
import { Order } from "../entity/order.entity";
import { ProductInteraction } from "../entity/product_interactions.entity";

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
  reset_token: string;
  expiry_token: number;
  avatar: string;
  created_at: number;
  updated_at: number;
  is_seller: boolean;
}

export interface UserRepositoryInterface {
  getUserPreferences(userId: string): Promise<any[]>;
  sellerLogin(email: string, password: string): Promise<void>;
  makeUserSeller(email: string): Promise<UpdateResult>;
  updateUserPreferences(id: string, preferences: UserPreferences): Promise<boolean>;
  updateUserPassword(id: string, newPassword: string): Promise<boolean>
  updateUserEmail(id: string, email: string): Promise<boolean>
  updateUserName(id: string, name: string): Promise<boolean>
  getUserById(id: string): Promise<boolean>
  getAllUsers(): Promise<UserInterface[]>
  removeUser(id: string): Promise<boolean>
  createUser(user: Partial<UserInterface>): Promise<UserInterface>;
  update(id: string, user: UserInterface): Promise<UserInterface>;
  delete(id: string): Promise<UserInterface>;
  findById(id: string): Promise<UserInterface | null>;
  findByEmail(email: string): Promise<UserInterface | null>;
}
