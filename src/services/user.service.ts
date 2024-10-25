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
import { ID } from "node-appwrite";

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

  // Appwrite Routes
  async getUserPreferences(userId: string){
    return await this.Users.getPrefs(userId)
  }

  async login(email: string, password: string) {
    // CHeck if User Exists
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    // Check if User is a Seller
    const isSeller = await UserRepository.isSeller(email);
    if (!isSeller) {
      throw new Error('User is not a seller.');
    }
    const account = new sdk.Account(this.AppWriteClient)
    try {
      const session = await account.createEmailPasswordSession(email, password)
      return session
    }
    catch (e) {
      throw new Error('Invalid credentials');
    }
  }

  async logout(session: string) {
    const account = new sdk.Account(this.AppWriteClient).setSession(session)
    return await account.deleteSessions()
  }

  async listSessions(id: string) {
    const sessions = this.Users.listSessions(id)
    return await sessions
  }

  async appwriteDeleteSession(id: string, sessionId: string) {
    const res = await this.Users.deleteSession(id, sessionId)
    return res
  }

  async makeUserSeller(id: string) {
    // Appwrite update user preferences
    const user = await this.appwriteGetUserById(id)
    if (!user) {
      throw new Error('User not found');
    }
    await this.appwriteUpdateUserPreferences(id, { is_seller: true })
    // DB update user preferences
    return await UserRepository.makeSeller(user.email);
  }
  async findById(id: string): Promise<UserInterface | null>{ 
    return this.UserRepository.findById(id)
  };
  async findByEmail(email: string): Promise<UserInterface | null>{
    return this.UserRepository.findByEmail(email)
  };

  async appwriteUpdateUserPreferences(id: string, preferences: Partial<UserPreferences>) {
    return await this.Users.updatePrefs(id, preferences)
  }

  async appwriteUpdateUserPassword(id: string, newPassword: string) {
    return await this.Users.updatePassword(id, newPassword)
  }

  async appwriteUpdateUserEmail(id: string, email: string) {
    return await this.Users.updateEmail(id, email)
  }

  async appwriteUpdateUserName(id: string, name: string) {
    return await this.Users.updateName(id, name)
  }

  async appwriteGetUserById(id: string) {
    return await this.Users.get(id);
  }

  async appwriteGetAllUsers() {
    return await this.Users.list()
  }

  async appwriteRemoveUser(id: string) {
    return await this.Users.deleteIdentity(id);
  }
  async update(id: string, user: UserInterface): Promise<UserInterface>{
    return await this.Users.update(id, user)
  };

  // Appwrite + DB Routes
  async createUser(user: Partial<UserInterface>): Promise<any>{
    // Add User on Appwrite
    const name = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`
    const generatedID = await crypto.randomUUID()
    const appwriteCreate = await this.Users.create(generatedID, user.email, '+1' + user.phone, user.password, name)
    await this.Users.updatePrefs(generatedID, { role: 'user', isSeller: false, isOnboarded: false })
    const dbCreate = await this.UserRepository.createAndSave(generatedID, user.first_name, user.last_name, user.email, user.password, user.postalCode, user.phone, user.country, user.city)
    if (!dbCreate && appwriteCreate) {
      this.Users.delete(generatedID)
      throw new Error('User not created')
    }
    if (dbCreate && !appwriteCreate) {
      this.UserRepository.delete(generatedID)
      throw new Error('User not created')
    }
    if (dbCreate && appwriteCreate) {
      return appwriteCreate
    }
  };
  async delete(id: string, user: UserInterface): Promise<UserInterface>{
    const userdata = await this.UserRepository.findByEmail(user.email)
    await this.UserRepository.findByEmailAndRemove(user.email)
    return await this.Users.delete(id)
  };


  async getAppWriteUserByEmail(email: string) {
    console.log(await this.Users.get(email))
    return await this.Users.get(email)
  }

  async getUserById(id: string) {
    const dbCheck = await this.UserRepository.findById(id)
    return dbCheck
  }

  async appwriteFindById(id: string) {
    return await this.Users.get(id)
  }
}