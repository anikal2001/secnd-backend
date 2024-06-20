"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = exports.registerController = exports.registerControllers = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
function registerControllers(app, path) {
    fs_1.default.readdirSync(path).forEach(file => {
        const filePath = `${path}/${file}`;
        if (fs_1.default.lstatSync(filePath).isDirectory()) {
            registerControllers(app, filePath);
        }
        else if (filePath.endsWith(".controller.ts")) {
            const controller = require(filePath);
            const controllerInstance = new controller[Object.keys(controller)[0]]();
            registerRoutes(app, controllerInstance);
        }
    });
}
exports.registerControllers = registerControllers;
// for one controller register.
// if you want set controller manual 
// then you can use it
// https://medium.com/@samir_rustamov/streamline-your-express-app-a-simple-guide-to-better-routing-and-middleware-with-typescript-24454c535720
function registerController(app, controller) {
    registerRoutes(app, new controller());
}
exports.registerController = registerController;
function registerRoutes(app, controllerInstance) {
    Object.getOwnPropertyNames(Object.getPrototypeOf(controllerInstance)).forEach(methodName => {
        // Retrieve route handler, path, HTTP method, and middlewares from metadata
        const routeHandler = controllerInstance[methodName];
        const path = Reflect.getMetadata("route", controllerInstance, methodName);
        const method = Reflect.getMetadata("method", controllerInstance, methodName);
        // get middlewares from Middeware decorators
        const middlewares = Reflect.getMetadata("middlewares", controllerInstance, methodName) || [];
        // If the method is valid, register the route with middlewares and the handler
        if (path && method) {
            const isMethodValid = method in app && typeof app[method] === 'function';
            if (isMethodValid) {
                app[method](path, ...middlewares, routeHandler);
            }
            else {
                console.warn(`Unsupported method '${method}' for route ${path}`);
            }
        }
    });
}
exports.registerRoutes = registerRoutes;
