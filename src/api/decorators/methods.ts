function methodDecoratorFactory(method: string) {
  return function (path: string): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata('route', path, target, propertyKey);
      Reflect.defineMetadata('method', method, target, propertyKey);
    };
  };
}

export function Post(path: string): MethodDecorator {
  return methodDecoratorFactory('post')(path);
}

export function Get(path: string): MethodDecorator {
  return methodDecoratorFactory('get')(path);
}
