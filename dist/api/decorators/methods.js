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

// src/api/decorators/methods.ts
var methods_exports = {};
__export(methods_exports, {
  Get: () => Get,
  Post: () => Post
});
module.exports = __toCommonJS(methods_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Get,
  Post
});
//# sourceMappingURL=methods.js.map