// src/infrastructure/shopify/type-guards.ts
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
export {
  isObject,
  isShopifyError
};
//# sourceMappingURL=type-guards.mjs.map