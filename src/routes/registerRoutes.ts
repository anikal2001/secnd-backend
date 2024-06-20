import { Application as App, RequestHandler } from "express";
import fs from "fs";

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export function registerControllers(app: App, path: string) {
    fs.readdirSync(path).forEach(file => {
        const filePath = `${path}/${file}`;
        if (fs.lstatSync(filePath).isDirectory()) {
            registerControllers(app, filePath);
        } else if (filePath.endsWith(".controller.ts")) {
            const controller = require(filePath);
            const controllerInstance = new controller[Object.keys(controller)[0]]();
            registerRoutes(app, controllerInstance);
        }
    });
}

// for one controller register.
// if you want set controller manual 
// then you can use it
// https://medium.com/@samir_rustamov/streamline-your-express-app-a-simple-guide-to-better-routing-and-middleware-with-typescript-24454c535720
export function registerController(app: App, controller: any) {
    registerRoutes(app, new controller());
}

export function registerRoutes(app: App, controllerInstance: any) {
    Object.getOwnPropertyNames(Object.getPrototypeOf(controllerInstance)).forEach(methodName => {
        // Retrieve route handler, path, HTTP method, and middlewares from metadata
        const routeHandler = controllerInstance[methodName];
        const path: string = Reflect.getMetadata("route", controllerInstance, methodName);
        const method: HttpMethod = Reflect.getMetadata("method", controllerInstance, methodName) as HttpMethod;

        // get middlewares from Middeware decorators
        const middlewares: RequestHandler[] = Reflect.getMetadata("middlewares", controllerInstance, methodName) || [];
        // If the method is valid, register the route with middlewares and the handler
        if (path && method) {
            const isMethodValid = method in app && typeof app[method] === 'function';
            if (isMethodValid) {
                (app[method] as Function)(path, ...middlewares, routeHandler);
            } else {
                console.warn(`Unsupported method '${method}' for route ${path}`);
            }
        }
    });
}