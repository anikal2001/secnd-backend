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
export {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery
};
//# sourceMappingURL=product.mjs.map