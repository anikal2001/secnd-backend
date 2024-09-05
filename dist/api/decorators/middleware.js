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

// src/api/decorators/middleware.ts
var middleware_exports = {};
__export(middleware_exports, {
  Middleware: () => Middleware,
  first: () => first,
  second: () => second
});
module.exports = __toCommonJS(middleware_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Middleware,
  first,
  second
});
//# sourceMappingURL=middleware.js.map