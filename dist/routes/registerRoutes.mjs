var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/routes/registerRoutes.ts
import fs from "fs";
function registerControllers(app, path) {
  fs.readdirSync(path).forEach((file) => {
    const filePath = `${path}/${file}`;
    if (fs.lstatSync(filePath).isDirectory()) {
      registerControllers(app, filePath);
    } else if (filePath.endsWith(".controller.ts")) {
      const controller = __require(filePath);
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
export {
  registerController,
  registerControllers,
  registerRoutes
};
//# sourceMappingURL=registerRoutes.mjs.map