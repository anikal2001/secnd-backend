// src/api/middleware/useMiddleware.ts
function UseMiddleware(...middlewares) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      const req = args[0];
      const res = args[1];
      const next = args[2];
      let i = 0;
      const runMiddleware = (error) => {
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
var useMiddleware_default = UseMiddleware;
export {
  useMiddleware_default as default
};
//# sourceMappingURL=useMiddleware.mjs.map