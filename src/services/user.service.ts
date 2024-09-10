import { AppDataSource } from "../database/config";
import { User } from "../entity/user.entity";
import { encrypt } from "../helpers/encrypt";
import { UserPreferences } from '../types/user';

const sdk = require('node-appwrite');
import { UserRepository } from "../repositories/user.repository";
import {
  UserInterface,
  UserRepositoryInterface,
} from "../interfaces/user.interface";

export class UserService implements UserRepositoryInterface {
  private AppWriteClient: any;
  private Users: any;
  private UserRepository: any;


  constructor() {
    const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env
    this.AppWriteClient = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(APPWRITE_PROJECT_ID) // Your project ID
    .setKey(APPWRITE_API_KEY) // Your secret API key
      .setSelfSigned() // Use only on dev mode with a self-signed SSL cert
    this.Users = new sdk.Users(this.AppWriteClient)
    this.UserRepository = UserRepository;
  }

  async getUserPreferences(userId: string){
    return await this.Users.getPrefs(userId)
  }

  async sellerLogin(email: string, password: string) {
    // Check if User is a Seller
    const isSeller = await UserRepository.isSeller(email);
    if (!isSeller) {
      throw new Error('User is not a seller.');
    }
    const account = new sdk.Account(this.AppWriteClient)
    const promise = account.createEmailPasswordSession(email, password)
    promise.then((response: any) => {
      console.log(response)
    }
    ).catch((error: any) => {
      console.log(error)
    })
  }

  async makeUserSeller(email: string) {
    return await UserRepository.makeSeller(email);
  }

  async updateUserPreferences(id: string, preferences: UserPreferences) {
    return await this.Users.updatePrefs(id, preferences)
  }

  async updateUserPassword(id: string, newPassword: string) {
    return await this.Users.updatePassword(id, newPassword)
  }

  async updateUserEmail(id: string, email: string) {
    return await this.Users.updateEmail(id, email)
  }

  async updateUserName(id: string, name: string) {
    return await this.Users.updateName(id, name)
  }

  async getUserById(id: string) {
    return await this.Users.get(id);
  }

  async getAllUsers() {
    return await this.Users.list()
  }

  async removeUser(id: string) {
    return await this.Users.deleteIdentity(id);
  }
  async createUser(user: UserInterface): Promise<UserInterface>{
    this.UserRepository.createAndSave(user)
    return this.Users.create(user.email, user.email, user.phone, user.password, user.first_name + user.last_name)
  };
  async update(id: string, user: UserInterface): Promise<UserInterface>{
    return await this.Users.update(id, user)
  };
  async delete(id: string): Promise<UserInterface>{
    return await this.Users.delete(id)
  };
  async findById(id: string): Promise<UserInterface | null>{ 
    return this.UserRepository.findById(id)
  };
  async findByEmail(email: string): Promise<UserInterface | null>{
    return this.UserRepository.findByEmail(email)
  };
}
