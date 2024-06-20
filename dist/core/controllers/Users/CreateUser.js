"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const passwordUtils_1 = require("../../../utils/passwordUtils");
class CreateUser {
    // TODO: Update type according to typeorm
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(createUserRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { username, email, password, firstName, lastName, postalCode, address, city } = createUserRequest;
            const existingUser = yield this.userRepository.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('Email already in use');
            }
            const hashedPassword = yield (0, passwordUtils_1.hashPassword)(password);
            const newUser = this.userRepository.create({
                username,
                firstName,
                lastName,
                postalCode,
                address,
                city,
                email,
                password: hashedPassword
            });
            yield this.userRepository.save(newUser);
            return newUser;
        });
    }
}
exports.default = CreateUser;
