// decorators/UseMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

function UseMiddleware(...middlewares: RequestHandler[]): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const req = args[0] as Request;
            const res = args[1] as Response;
            const next = args[2] as NextFunction;

            let i = 0;

            const runMiddleware = (error?: any) => {
                if (error) {
                    return next(error);
                }
                if (i < middlewares.length) {
                    middlewares[i](req, res, runMiddleware);
                    i++;
                } else {
                    originalMethod.apply(this, args);
                }
            };

            runMiddleware();
        };

        return descriptor;
    };
}
export default UseMiddleware;