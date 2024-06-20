"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable no-console */
const express_1 = tslib_1.__importDefault(require("express"));
require("reflect-metadata");
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const config_1 = tslib_1.__importDefault(require("./config"));
const index_1 = tslib_1.__importDefault(require("./routes/index"));
const error_middleware_1 = tslib_1.__importDefault(require("./api/middleware/error.middleware"));
const PORT = config_1.default.port || 8080;
// create instance server
const app = (0, express_1.default)();
// connect to database
config_1.default.connect();
// middlewares
// parsing incoming requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// logger middleware
app.use((0, morgan_1.default)('dev'));
// security
app.use((0, helmet_1.default)());
//add routea
app.get('/', (_req, res) => {
    res.json('Hello Server! 🚀');
});
app.use('/api', index_1.default);
app.use(error_middleware_1.default);
app.use((_req, res) => {
    res.status(404).json('Whoops!! You are lost go back to documentation to find your way back to Home again 😂');
});
//start express server
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is starting at port:${PORT}`);
});
exports.default = app;
