import { UserRepository } from '../repositories/UserRepository';
import * as bcrypt from 'bcrypt';

export class UserService {
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
    const newUser = UserRepository.create({
      email,
      password,
      firstName,
      lastName,
      country,
      city,
      address,
      postalCode,
      phone,
      avatar,
    });

    return await UserRepository.save(newUser);
  }

  async authenticateUser(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found.');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials.');
    }

    // Assume a function that generates a JWT token
    return 'generated-jwt-token'; // Simulated token for example purposes
  }

  async changePassword(id: number, currentPassword: string, newPassword: string, confirmPassword: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('User not found.');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials.');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirm password do not match.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await UserRepository.save(user);

    return 'Password updated successfully.';
  }

  async updateUserPreferences(id: number, user: any) {
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found.');
    }

    const updatedUser = UserRepository.merge(existingUser, user);
    return await UserRepository.save(updatedUser);
  }

  async getAllUsers() {
    return await UserRepository.find();
  }
}
