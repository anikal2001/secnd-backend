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

// src/api/middleware/user.middleware.ts
var user_middleware_exports = {};
__export(user_middleware_exports, {
  passwordValidations: () => passwordValidations,
  validateUserFields: () => validateUserFields
});
module.exports = __toCommonJS(user_middleware_exports);
var import_express_validator = require("express-validator");
var emailValidations = (email) => {
  return (0, import_express_validator.body)("email").exists().withMessage("Email is required.").isEmail().withMessage("Email is not valid.").isLength({ max: 50 }).withMessage("Email cannot be more than 50 characters long.");
};
var usernameValidations = (username) => {
  return (0, import_express_validator.body)("username").exists().withMessage("Username is required.").isAlphanumeric().isLength({ min: 6 }).withMessage("Username must be at least 3 characters long.").isLength({ max: 24 }).withMessage("Username cannot be more than 50 characters long.");
};
var passwordValidations = (password) => {
  return (0, import_express_validator.body)("password").exists().withMessage("Password is required.").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.").isLength({ max: 50 }).withMessage("Password cannot be more than 50 characters long.").matches(/\d/).withMessage("Password must contain at least one number.").matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character.").matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.").matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.");
};
var validateUserFields = async (req, res, next) => {
  console.log("validating");
  const validations = [
    //@ts-expect-error error1
    emailValidations(),
    //@ts-expect-error error1
    usernameValidations()
    // passwordValidations(req.body.password),
    // addressValidations(req.body.address),
    // cityValidations(req.body.city),
    // postalCodeValidations(req.body.postalCode)
  ];
  for (const validation of validations) {
    const result = await validation.run(req);
    if (!result.isEmpty()) break;
  }
  const errors = (0, import_express_validator.validationResult)(req);
  if (!errors.isEmpty()) {
    return next();
  }
  res.status(500).json({ message: "Validation failed", errors: errors.array()[0].msg });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  passwordValidations,
  validateUserFields
});
//# sourceMappingURL=user.middleware.js.map