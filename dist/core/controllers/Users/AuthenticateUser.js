"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class AuthenticateUser {
    execute(authenticateUserRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // const userRepository = getRepository(User);
            // const { email, password } = authenticateUserRequest;
            // const user = await userRepository.findOne({ where: { email } });
            // if (!user) {
            //     throw new Error('User not found');
            // }
            // const isValid = await comparePasswords(password, user.password);
            // if (!isValid) {
            //     throw new Error('Invalid password');
            // }
            // return generateToken(user.id);
            return;
        });
    }
}
exports.default = AuthenticateUser;
