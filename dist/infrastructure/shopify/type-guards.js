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

// src/infrastructure/shopify/type-guards.ts
var type_guards_exports = {};
__export(type_guards_exports, {
  isObject: () => isObject,
  isShopifyError: () => isShopifyError
});
module.exports = __toCommonJS(type_guards_exports);
var isObject = (object) => {
  return typeof object === "object" && object !== null && !Array.isArray(object);
};
var isShopifyError = (error) => {
  if (!isObject(error)) return false;
  if (error instanceof Error) return true;
  return findError(error);
};
function findError(error) {
  if (Object.prototype.toString.call(error) === "[object Error]") {
    return true;
  }
  const prototype = Object.getPrototypeOf(error);
  return prototype === null ? false : findError(prototype);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isObject,
  isShopifyError
});
//# sourceMappingURL=type-guards.js.map