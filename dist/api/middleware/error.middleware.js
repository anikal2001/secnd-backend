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

// src/api/middleware/error.middleware.ts
var error_middleware_exports = {};
__export(error_middleware_exports, {
  default: () => error_middleware_default
});
module.exports = __toCommonJS(error_middleware_exports);
var errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Whoops! something went wrong";
  res.status(status).json({ status, message });
};
var error_middleware_default = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map