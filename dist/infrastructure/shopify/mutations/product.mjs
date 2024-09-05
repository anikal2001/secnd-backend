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

// src/infrastructure/shopify/mutations/product.ts
var addProductMutation = (
  /* GraphQL */
  `
mutation createProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
  productCreate(input: $input, media: $media) {
    product {
      id
      title
      descriptionHtml
      tags
      vendor
      variants(first: 1) {
        edges {
          node {
            price
            selectedOptions {
              name
              value
            }
          }
        }
      }
      images(first: 10) {
        edges {
          node {
            originalSrc
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`
);
var updateProductMutation = (
  /* GraphQL */
  `
  mutation {
    productUpdate(
      input: {
        id: $id
        title: $title
        description: $description
        price: $price
        primaryColor: $primaryColor
        secondaryColor: $secondaryColor
        vendor: $seller
        size: $size
        category: $category
        condition: $condition
        tags: $tags
        brand: $brand
        material: $material
        gender: $gender
        imageUrls: $imageUrls
      }
    ) {
      product {
        id
      }
    }
  }
  ${product_default}
`
);
var deleteProductMutation = (
  /* GraphQL */
  `
mutation productDelete($input: ProductDeleteInput!) {
  productDelete(input: $input) {
    deletedProductId
    userErrors {
      field
      message
    }
  }
}
`
);
export {
  addProductMutation,
  deleteProductMutation,
  updateProductMutation
};
//# sourceMappingURL=product.mjs.map