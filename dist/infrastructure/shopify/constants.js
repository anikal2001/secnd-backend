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

// src/infrastructure/shopify/constants.ts
var constants_exports = {};
__export(constants_exports, {
  DEFAULT_OPTION: () => DEFAULT_OPTION,
  HIDDEN_PRODUCT_TAG: () => HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT: () => SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS: () => TAGS,
  defaultSort: () => defaultSort,
  sorting: () => sorting
});
module.exports = __toCommonJS(constants_exports);
var defaultSort = {
  title: "Relevance",
  slug: null,
  sortKey: "RELEVANCE",
  reverse: false
};
var sorting = [
  defaultSort,
  { title: "Trending", slug: "trending-desc", sortKey: "BEST_SELLING", reverse: false },
  // asc
  { title: "Latest arrivals", slug: "latest-desc", sortKey: "CREATED_AT", reverse: true },
  { title: "Price: Low to high", slug: "price-asc", sortKey: "PRICE", reverse: false },
  // asc
  { title: "Price: High to low", slug: "price-desc", sortKey: "PRICE", reverse: true }
];
var TAGS = {
  collections: "collections",
  products: "products",
  cart: "cart"
};
var HIDDEN_PRODUCT_TAG = "nextjs-frontend-hidden";
var DEFAULT_OPTION = "Default Title";
var SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2024-07/graphql.json";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_OPTION,
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
  defaultSort,
  sorting
});
//# sourceMappingURL=constants.js.map