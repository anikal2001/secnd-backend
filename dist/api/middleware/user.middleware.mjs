// src/api/middleware/user.middleware.ts
import { body, validationResult } from "express-validator";
var emailValidations = (email) => {
  return body("email").exists().withMessage("Email is required.").isEmail().withMessage("Email is not valid.").isLength({ max: 50 }).withMessage("Email cannot be more than 50 characters long.");
};
var usernameValidations = (username) => {
  return body("username").exists().withMessage("Username is required.").isAlphanumeric().isLength({ min: 6 }).withMessage("Username must be at least 3 characters long.").isLength({ max: 24 }).withMessage("Username cannot be more than 50 characters long.");
};
var passwordValidations = (password) => {
  return body("password").exists().withMessage("Password is required.").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.").isLength({ max: 50 }).withMessage("Password cannot be more than 50 characters long.").matches(/\d/).withMessage("Password must contain at least one number.").matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character.").matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.").matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.");
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next();
  }
  res.status(500).json({ message: "Validation failed", errors: errors.array()[0].msg });
};
export {
  passwordValidations,
  validateUserFields
};
//# sourceMappingURL=user.middleware.mjs.map