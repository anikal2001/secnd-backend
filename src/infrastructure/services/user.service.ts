import { UserRepository } from '../repositories/UserRepository';
import { AddressRepository } from '../repositories/AddressRepository';
import * as bcrypt from 'bcrypt';
import { Country, Provinces } from '../../utils/users.enums';
import AppwriteClient from '../../config'
import { UserPreferences } from '../../types/user';
const sdk = require('node-appwrite');

export class UserService {
  private AppWriteClient: any;
  private Users: any;


  constructor() {
    const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env
    this.AppWriteClient = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(APPWRITE_PROJECT_ID) // Your project ID
    .setKey(APPWRITE_API_KEY) // Your secret API key
      .setSelfSigned() // Use only on dev mode with a self-signed SSL cert
    this.Users = new sdk.Users(this.AppWriteClient)
  }
  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    country: string,
    city: string,
    address: string,
    postalCode: string,
    phone: string,
    avatar: string,
  ) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with the provided email address.');
    }
    // const newAddress = AddressRepository.create({
    //   country: Country.CANADA,
    //   province: Provinces.ONTARIO,
    //   city,
    //   address,
    //   postalCode,
    //   phone,
    // });
    const newUser = UserRepository.create({
      email,
      password,
      firstName,
      lastName,
      postalCode,
      phone,
      avatar,
    });

    return await UserRepository.save(newUser);
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
}
