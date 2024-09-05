// src/api/middleware/error.middleware.ts
var errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Whoops! something went wrong";
  res.status(status).json({ status, message });
};
var error_middleware_default = errorMiddleware;
export {
  error_middleware_default as default
};
//# sourceMappingURL=error.middleware.mjs.map