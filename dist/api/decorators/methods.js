"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = exports.Post = void 0;
function methodDecoratorFactory(method) {
    return function (path) {
        return function (target, propertyKey, descriptor) {
            Reflect.defineMetadata("route", path, target, propertyKey);
            Reflect.defineMetadata("method", method, target, propertyKey);
        };
    };
}
function Post(path) {
    return methodDecoratorFactory("post")(path);
}
exports.Post = Post;
function Get(path) {
    return methodDecoratorFactory("get")(path);
}
exports.Get = Get;
