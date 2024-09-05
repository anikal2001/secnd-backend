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

// src/infrastructure/dto/UserDTO.ts
var UserDTO_exports = {};
__export(UserDTO_exports, {
  UserDto: () => UserDto
});
module.exports = __toCommonJS(UserDTO_exports);
var UserDto = class {
  user_id;
  firstName;
  lastName;
  email;
  cart;
  country;
  city;
  postalCode;
  phone;
  resetToken;
  expiryToken;
  avatar;
  createdAt;
  updatedAt;
  orders;
  // Assuming the DTO only needs the order IDs
  transactions;
  // Assuming the DTO only needs the transaction IDs
  interactions;
  // Assuming the DTO only needs the interaction IDs
  isSeller;
  password;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UserDto
});
//# sourceMappingURL=UserDTO.js.map