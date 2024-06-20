"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = tslib_1.__importDefault(require("supertest"));
const index_1 = tslib_1.__importDefault(require("../index"));
// create a request object
const request = (0, supertest_1.default)(index_1.default);
describe('Test basic endpoint server', () => {
    it('Get the / endpoint', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/');
        expect(response.status).toBe(200);
    }));
});
