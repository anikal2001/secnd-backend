"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const tslib_1 = require("tslib");
const database_1 = tslib_1.__importDefault(require("../db/database"));
const user_model_1 = require("../../core/entity/user.model");
exports.UserRepository = database_1.default.getRepository(user_model_1.User).extend({
    findByName(firstName, lastName) {
        return this.createQueryBuilder('user')
            .where('user.firstName = :firstName', { firstName })
            .andWhere('user.lastName = :lastName', { lastName })
            .getMany();
    },
    findByEmail(email) {
        return this.createQueryBuilder('user')
            .where('user.email = :email', { email })
            .getOne();
    },
    findById(id) {
        return this.createQueryBuilder('user')
            .where('user.id = :id', { id })
            .getOne();
    },
    findByIdandRemove(id) {
        return this.createQueryBuilder('user')
            .delete()
            .from(user_model_1.User)
            .where('user.id = :id', { id })
            .execute();
    }
});
