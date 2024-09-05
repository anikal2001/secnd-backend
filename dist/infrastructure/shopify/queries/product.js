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

// src/infrastructure/shopify/queries/product.ts
var product_exports = {};
__export(product_exports, {
  getProductQuery: () => getProductQuery,
  getProductRecommendationsQuery: () => getProductRecommendationsQuery,
  getProductsQuery: () => getProductsQuery
});
module.exports = __toCommonJS(product_exports);

// src/infrastructure/shopify/fragment/image.ts
var imageFragment = (
  /* GraphQL */
  `
  fragment image on Image {
    url
    altText
    width
    height
  }
`
);
var image_default = imageFragment;

// src/infrastructure/shopify/fragment/product.ts
var productFragment = (
  /* GraphQL */
  `
  fragment product on Product {
    id
    handle
    availableForSale
    title
    description
    descriptionHtml
    options {
      id
      name
      values
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    featuredImage {
      ...image
    }
    images(first: 20) {
      edges {
        node {
          ...image
        }
      }
    }
    tags
    updatedAt
  }
  ${image_default}
`
);
var product_default = productFragment;

// src/infrastructure/shopify/queries/product.ts
var getProductQuery = (
  /* GraphQL */
  `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${product_default}
`
);
var getProductsQuery = (
  /* GraphQL */
  `
query {
  products(first: 10, reverse: true) {
    edges {
      node {
        id
        title
        handle
        resourcePublicationOnCurrentPublication {
          publication {
            name
            id
          }
          publishDate
          isPublished
        }
      }
    }
  }
}
`
);
var getProductRecommendationsQuery = (
  /* GraphQL */
  `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...product
    }
  }
  ${product_default}
`
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery
});
//# sourceMappingURL=product.js.map