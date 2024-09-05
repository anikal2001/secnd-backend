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

// src/utils/users.enums.ts
var users_enums_exports = {};
__export(users_enums_exports, {
  Country: () => Country,
  Provinces: () => Provinces,
  States: () => States
});
module.exports = __toCommonJS(users_enums_exports);
var Country = /* @__PURE__ */ ((Country2) => {
  Country2["USA"] = "USA";
  Country2["CANADA"] = "CANADA";
  Country2["MEXICO"] = "MEXICO";
  return Country2;
})(Country || {});
var Provinces = /* @__PURE__ */ ((Provinces2) => {
  Provinces2["ALBERTA"] = "ALBERTA";
  Provinces2["BRITISH_COLUMBIA"] = "BRITISH COLUMBIA";
  Provinces2["MANITOBA"] = "MANITOBA";
  Provinces2["NEW_BRUNSWICK"] = "NEW BRUNSWICK";
  Provinces2["NEWFOUNDLAND_AND_LABRADOR"] = "NEWFOUNDLAND AND LABRADOR";
  Provinces2["NOVA_SCOTIA"] = "NOVA SCOTIA";
  Provinces2["ONTARIO"] = "ONTARIO";
  Provinces2["PRINCE_EDWARD_ISLAND"] = "PRINCE EDWARD ISLAND";
  Provinces2["QUEBEC"] = "QUEBEC";
  Provinces2["SASKATCHEWAN"] = "SASKATCHEWAN";
  Provinces2["NORTHWEST_TERRITORIES"] = "NORTHWEST TERRITORIES";
  Provinces2["NUNAVUT"] = "NUNAVUT";
  Provinces2["YUKON"] = "YUKON";
  return Provinces2;
})(Provinces || {});
var States = /* @__PURE__ */ ((States2) => {
  States2["ALABAMA"] = "ALABAMA";
  States2["ALASKA"] = "ALASKA";
  States2["ARIZONA"] = "ARIZONA";
  States2["ARKANSAS"] = "ARKANSAS";
  States2["CALIFORNIA"] = "CALIFORNIA";
  States2["COLORADO"] = "COLORADO";
  States2["CONNECTICUT"] = "CONNECTICUT";
  States2["DELAWARE"] = "DELAWARE";
  States2["FLORIDA"] = "FLORIDA";
  States2["GEORGIA"] = "GEORGIA";
  States2["HAWAII"] = "HAWAII";
  States2["IDAHO"] = "IDAHO";
  States2["ILLINOIS"] = "ILLINOIS";
  States2["INDIANA"] = "INDIANA";
  States2["IOWA"] = "IOWA";
  States2["KANSAS"] = "KANSAS";
  States2["KENTUCKY"] = "KENTUCKY";
  States2["LOUISIANA"] = "LOUISIANA";
  States2["MAINE"] = "MAINE";
  States2["MARYLAND"] = "MARYLAND";
  States2["MASSACHUSETTS"] = "MASSACHUSETTS";
  States2["MICHIGAN"] = "MICHIGAN";
  States2["MINNESOTA"] = "MINNESOTA";
  States2["MISSISSIPPI"] = "MISSISSIPPI";
  States2["MISSOURI"] = "MISSOURI";
  States2["MONTANA"] = "MONTANA";
  States2["NEBRASKA"] = "NEBRASKA";
  States2["NEVADA"] = "NEVADA";
  States2["NEW_HAMPSHIRE"] = "NEW HAMPSHIRE";
  States2["NEW_JERSEY"] = "NEW JERSEY";
  States2["NEW_MEXICO"] = "NEW MEXICO";
  States2["NEW_YORK"] = "NEW YORK";
  States2["NORTH_CAROLINA"] = "NORTH CAROLINA";
  States2["NORTH_DAKOTA"] = "NORTH DAKOTA";
  States2["OHIO"] = "OHIO";
  States2["OKLAHOMA"] = "OKLAHOMA";
  States2["OREGON"] = "OREGON";
  States2["PENNSYLVANIA"] = "PENNSYLVANIA";
  States2["RHODE_ISLAND"] = "RHODE ISLAND";
  States2["SOUTH_CAROLINA"] = "SOUTH CAROLINA";
  States2["SOUTH_DAKOTA"] = "SOUTH DAKOTA";
  States2["TENNESSEE"] = "TENNESSEE";
  States2["TEXAS"] = "TEXAS";
  States2["UTAH"] = "UTAH";
  States2["VERMONT"] = "VERMONT";
  States2["VIRGINIA"] = "VIRGINIA";
  States2["WASHINGTON"] = "WASHINGTON";
  States2["WISCONSIN"] = "WISCONSIN";
  States2["WYOMING"] = "WYOMING";
  return States2;
})(States || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Country,
  Provinces,
  States
});
//# sourceMappingURL=users.enums.js.map