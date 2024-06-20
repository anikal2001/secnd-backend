"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
function Middleware(middleware) {
    return function (target, propertyKey, descriptor) {
        const middlewares = Reflect.getMetadata("middlewares", target, propertyKey) || [];
        middlewares.push(middleware);
        Reflect.defineMetadata("middlewares", middlewares, target, propertyKey);
    };
}
exports.Middleware = Middleware;
