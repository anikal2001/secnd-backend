"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
const tslib_1 = require("tslib");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const saltRounds = 10;
bcrypt_1.default.genSalt(saltRounds, (err, salt) => {
    if (err) {
        // Handle error
        throw new Error('Error generating salt');
        return;
    }
    // Salt generation successful, proceed to hash the password
});
const hashPassword = (password) => {
    const saltRounds = 10;
    return bcrypt_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
