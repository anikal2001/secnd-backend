// src/api/decorators/methods.ts
function methodDecoratorFactory(method) {
  return function(path) {
    return function(target, propertyKey, descriptor) {
      Reflect.defineMetadata("route", path, target, propertyKey);
      Reflect.defineMetadata("method", method, target, propertyKey);
    };
  };
}
function Post(path) {
  return methodDecoratorFactory("post")(path);
}
function Get(path) {
  return methodDecoratorFactory("get")(path);
}
export {
  Get,
  Post
};
//# sourceMappingURL=methods.mjs.map