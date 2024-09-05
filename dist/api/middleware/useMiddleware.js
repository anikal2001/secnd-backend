"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/api/middleware/useMiddleware.ts
var useMiddleware_exports = {};
__export(useMiddleware_exports, {
  default: () => useMiddleware_default
});
module.exports = __toCommonJS(useMiddleware_exports);
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
//# sourceMappingURL=useMiddleware.js.map