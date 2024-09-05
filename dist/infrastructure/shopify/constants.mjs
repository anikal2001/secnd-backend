// src/infrastructure/shopify/constants.ts
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
export {
  DEFAULT_OPTION,
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
  defaultSort,
  sorting
};
//# sourceMappingURL=constants.mjs.map