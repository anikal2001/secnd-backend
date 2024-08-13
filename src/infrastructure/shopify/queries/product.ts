import productFragment from '../fragment/product';

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productFragment}
`;

// export const getProductsQuery = /* GraphQL */ `
//   query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
//     products(sortKey: $sortKey, reverse: $reverse, query: $query, first: 100) {
//       edges {
//         node {
//           ...product
//         }
//       }
//     }
//   }
//   ${productFragment}
// `;

export const getProductsQuery = /* GraphQL */ `
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
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...product
    }
  }
  ${productFragment}
`;
