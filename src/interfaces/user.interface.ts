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
  reset_token: string;
  expiry_token: number;
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
  appwriteGetAllUsers(): Promise<UserInterface[]>
  appwriteRemoveUser(id: string): Promise<boolean>
  createUser(user: Partial<UserInterface>): Promise<UserInterface>;
  update(id: string, user: UserInterface): Promise<UserInterface>;
  delete(id: string, user: UserInterface): Promise<UserInterface>;
  findById(id: string): Promise<UserInterface | null>;
  findByEmail(email: string): Promise<UserInterface | null>;
}
