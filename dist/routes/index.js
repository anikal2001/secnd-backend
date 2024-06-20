"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
const user_apis_1 = tslib_1.__importDefault(require("./api/user.apis"));
const product_apis_1 = tslib_1.__importDefault(require("./api/product.apis"));
const router = express_1.default.Router();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
});
// apply rate limiter to all requests
router.use(limiter);
router.use('/user', user_apis_1.default);
router.use('/product', product_apis_1.default);
exports.default = router;
