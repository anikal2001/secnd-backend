import { RequestHandler } from "express";

export function Middleware(middleware: RequestHandler): MethodDecorator {
    console.log("Middleware(): factory evaluated");
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const middlewares: RequestHandler[] = Reflect.getMetadata("middlewares", target, propertyKey) || [];
        middlewares.push(middleware);
        Reflect.defineMetadata("middlewares", middlewares, target, propertyKey);
    };
}

function first() {
    console.log("first(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("first(): called");
    };
}

function second() {
    console.log("second(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("second(): called");
    };
}


export { first, second }