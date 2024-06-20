"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable no-console */
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const database_1 = tslib_1.__importDefault(require("./infrastructure/db/database"));
dotenv_1.default.config();
const { PORT, JWT_SECERT, EXPIRES_IN } = process.env;
const DBconnection = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Connecting to database2...');
        yield database_1.default.initialize().then(() => {
            console.log('Data Source has been initialized!');
        })
            .catch((err) => {
            console.error('Error during Data Source initialization:', err);
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = {
    connect: DBconnection,
    port: PORT,
    JWT_SECERT: JWT_SECERT,
    EXPIRES_IN: EXPIRES_IN,
};
