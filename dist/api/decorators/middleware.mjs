// src/api/decorators/middleware.ts
function Middleware(middleware) {
  console.log("Middleware(): factory evaluated");
  return function(target, propertyKey, descriptor) {
    const middlewares = Reflect.getMetadata("middlewares", target, propertyKey) || [];
    middlewares.push(middleware);
    Reflect.defineMetadata("middlewares", middlewares, target, propertyKey);
  };
}
function first() {
  console.log("first(): factory evaluated");
  return function(target, propertyKey, descriptor) {
    console.log("first(): called");
  };
}
function second() {
  console.log("second(): factory evaluated");
  return function(target, propertyKey, descriptor) {
    console.log("second(): called");
  };
}
export {
  Middleware,
  first,
  second
};
//# sourceMappingURL=middleware.mjs.map