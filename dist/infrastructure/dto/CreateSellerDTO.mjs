var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/infrastructure/dto/CreateSellerDTO.ts
import { IsNotEmpty, IsString } from "class-validator";
var CreateSellerDto = class {
  email;
  store_name;
  store_description;
  store_logo;
};
__decorateClass([
  IsNotEmpty(),
  IsString()
], CreateSellerDto.prototype, "email", 2);
__decorateClass([
  IsNotEmpty(),
  IsString()
], CreateSellerDto.prototype, "store_name", 2);
__decorateClass([
  IsString()
], CreateSellerDto.prototype, "store_description", 2);
__decorateClass([
  IsString()
], CreateSellerDto.prototype, "store_logo", 2);
export {
  CreateSellerDto
};
//# sourceMappingURL=CreateSellerDTO.mjs.map