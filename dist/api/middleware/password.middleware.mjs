// src/api/middleware/password.middleware.ts
import bcrypt from "bcrypt";
var hashPassword = async (req, res, next) => {
  const { password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  req.body.password = hashedPassword;
  next();
};
export {
  hashPassword
};
//# sourceMappingURL=password.middleware.mjs.map