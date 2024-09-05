// src/api/middleware/products.middleware.ts
var validateProductFields = (req, res, next) => {
  const { name, price, description, category, quantity } = req.body;
  if (!name || !price || !description || !category || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }
  next();
};
export {
  validateProductFields
};
//# sourceMappingURL=products.middleware.mjs.map