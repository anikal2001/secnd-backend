"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/registerRoutes.ts
var registerRoutes_exports = {};
__export(registerRoutes_exports, {
  registerController: () => registerController,
  registerControllers: () => registerControllers,
  registerRoutes: () => registerRoutes
});
module.exports = __toCommonJS(registerRoutes_exports);
var import_fs = __toESM(require("fs"));
function registerControllers(app, path) {
  import_fs.default.readdirSync(path).forEach((file) => {
    const filePath = `${path}/${file}`;
    if (import_fs.default.lstatSync(filePath).isDirectory()) {
      registerControllers(app, filePath);
    } else if (filePath.endsWith(".controller.ts")) {
      const controller = require(filePath);
      const controllerInstance = new controller[Object.keys(controller)[0]]();
      registerRoutes(app, controllerInstance);
    }
  });
}
function registerController(app, controller) {
  registerRoutes(app, new controller());
}
function registerRoutes(app, controllerInstance) {
  Object.getOwnPropertyNames(Object.getPrototypeOf(controllerInstance)).forEach((methodName) => {
    const routeHandler = controllerInstance[methodName];
    const path = Reflect.getMetadata("route", controllerInstance, methodName);
    const method = Reflect.getMetadata("method", controllerInstance, methodName);
    const middlewares = Reflect.getMetadata("middlewares", controllerInstance, methodName) || [];
    if (path && method) {
      const isMethodValid = method in app && typeof app[method] === "function";
      if (isMethodValid) {
        app[method](path, ...middlewares, routeHandler);
      } else {
        console.warn(`Unsupported method '${method}' for route ${path}`);
      }
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  registerController,
  registerControllers,
  registerRoutes
});
//# sourceMappingURL=registerRoutes.js.map