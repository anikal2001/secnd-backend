import productFragment from '../fragment/product';

export const addProductMutation = /* GraphQL */ `
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
`;

export const updateProductMutation = /* GraphQL */ `
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
  ${productFragment}
`;

export const deleteProductMutation = /* GraphQL */ `
mutation productDelete($input: ProductDeleteInput!) {
  productDelete(input: $input) {
    deletedProductId
    userErrors {
      field
      message
    }
  }
}
`;
