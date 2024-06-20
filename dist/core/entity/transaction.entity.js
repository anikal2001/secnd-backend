"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.TransactionStatus = exports.TransactionType = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const user_model_1 = require("./user.model");
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["PAYMENT"] = "payment";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transaction = class Transaction extends typeorm_1.BaseEntity {
};
exports.Transaction = Transaction;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_model_1.User, (user) => user.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", user_model_1.User)
], Transaction.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    tslib_1.__metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionType,
        default: TransactionType.DEPOSIT
    }),
    tslib_1.__metadata("design:type", String)
], Transaction.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING
    }),
    tslib_1.__metadata("design:type", String)
], Transaction.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('timestamp'),
    tslib_1.__metadata("design:type", Date)
], Transaction.prototype, "transactionDate", void 0);
exports.Transaction = Transaction = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], Transaction);
