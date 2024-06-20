"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const tslib_1 = require("tslib");
const UserRepository_1 = require("../repositories/UserRepository");
const bcrypt = tslib_1.__importStar(require("bcrypt"));
class UserService {
    createUser(email, password, firstName, lastName, country, city, address, postalCode, phone, avatar) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const existingUser = yield UserRepository_1.UserRepository.findByEmail(email);
            if (existingUser) {
                throw new Error('User already exists with the provided email address.');
            }
            const hashedPassword = yield bcrypt.hash(password, 10);
            const newUser = UserRepository_1.UserRepository.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                country,
                city,
                address,
                postalCode,
                phone,
                avatar
            });
            return yield UserRepository_1.UserRepository.save(newUser);
        });
    }
    authenticateUser(email, password) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield UserRepository_1.UserRepository.findByEmail(email);
            if (!user) {
                throw new Error('User not found.');
            }
            const isValid = yield bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Invalid credentials.');
            }
            // Assume a function that generates a JWT token
            return 'generated-jwt-token'; // Simulated token for example purposes
        });
    }
    changePassword(id, currentPassword, newPassword, confirmPassword) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield UserRepository_1.UserRepository.findById(id);
            if (!user) {
                throw new Error('User not found.');
            }
            const isValid = yield bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                throw new Error('Invalid credentials.');
            }
            if (newPassword !== confirmPassword) {
                throw new Error('New password and confirm password do not match.');
            }
            user.password = yield bcrypt.hash(newPassword, 10);
            yield UserRepository_1.UserRepository.save(user);
            return 'Password updated successfully.';
        });
    }
    updateUser(id, user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const existingUser = yield UserRepository_1.UserRepository.findById(id);
            if (!existingUser) {
                throw new Error('User not found.');
            }
            const updatedUser = UserRepository_1.UserRepository.merge(existingUser, user);
            return yield UserRepository_1.UserRepository.save(updatedUser);
        });
    }
    getAllUsers() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield UserRepository_1.UserRepository.find();
        });
    }
}
exports.UserService = UserService;
