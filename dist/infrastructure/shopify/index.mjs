// src/infrastructure/shopify/constants.ts
var TAGS = {
  collections: "collections",
  products: "products",
  cart: "cart"
};
var SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2024-07/graphql.json";

// src/infrastructure/shopify/type-guards.ts
var isObject = (object) => {
  return typeof object === "object" && object !== null && !Array.isArray(object);
};
var isShopifyError = (error) => {
  if (!isObject(error)) return false;
  if (error instanceof Error) return true;
  return findError(error);
};
function findError(error) {
  if (Object.prototype.toString.call(error) === "[object Error]") {
    return true;
  }
  const prototype = Object.getPrototypeOf(error);
  return prototype === null ? false : findError(prototype);
}

// src/infrastructure/shopify/utils.ts
var ensureStartsWith = (stringToCheck, startsWith) => stringToCheck.startsWith(startsWith) ? stringToCheck : `${startsWith}${stringToCheck}`;

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

// src/infrastructure/shopify/fragment/cart.ts
var cartFragment = (
  /* GraphQL */
  `
  fragment cart on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              product {
                ...product
              }
            }
          }
        }
      }
    }
    totalQuantity
  }
  ${product_default}
`
);
var cart_default = cartFragment;

// src/infrastructure/shopify/mutations/cart.ts
var addToCartMutation = (
  /* GraphQL */
  `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${cart_default}
`
);
var createCartMutation = (
  /* GraphQL */
  `
  mutation createCart($lineItems: [CartLineInput!]) {
    cartCreate(input: { lines: $lineItems }) {
      cart {
        ...cart
      }
    }
  }
  ${cart_default}
`
);
var editCartItemsMutation = (
  /* GraphQL */
  `
  mutation editCartItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${cart_default}
`
);
var removeFromCartMutation = (
  /* GraphQL */
  `
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cart
      }
    }
  }
  ${cart_default}
`
);

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

// src/infrastructure/shopify/queries/cart.ts
var getCartQuery = (
  /* GraphQL */
  `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...cart
    }
  }
  ${cart_default}
`
);

// src/infrastructure/shopify/queries/collection.ts
var collectionFragment = (
  /* GraphQL */
  `
  fragment collection on Collection {
    handle
    title
    description
    updatedAt
  }
`
);
var getCollectionQuery = (
  /* GraphQL */
  `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...collection
    }
  }
  ${collectionFragment}
`
);
var getCollectionsQuery = (
  /* GraphQL */
  `
  query getCollections {
    collections(first: 100, sortKey: TITLE) {
      edges {
        node {
          ...collection
        }
      }
    }
  }
  ${collectionFragment}
`
);
var getCollectionProductsQuery = (
  /* GraphQL */
  `
  query getCollectionProducts($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      products(sortKey: $sortKey, reverse: $reverse, first: 100) {
        edges {
          node {
            ...product
          }
        }
      }
    }
  }
  ${product_default}
`
);

// src/infrastructure/shopify/queries/menu.ts
var getMenuQuery = (
  /* GraphQL */
  `
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        url
      }
    }
  }
`
);

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

// src/infrastructure/shopify/index.ts
var domain = process.env.SHOPIFY_STORE_DOMAIN ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://") : "";
var endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
var adminEndpoint = `https://secndapp.myshopify.com/admin/api/2024-07/graphql.json`;
var adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
var key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
async function shopifyFetch({
  cache = "force-cache",
  headers,
  query,
  tags,
  variables
}) {
  try {
    const result = await fetch(adminEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminAccessToken,
        // 'Shopify-Storefront-Private-Token': key,
        ...headers
      },
      body: JSON.stringify({
        ...query && { query },
        ...variables && { variables }
      }),
      cache,
      ...tags && { next: { tags } }
    });
    const body = await result.json();
    if (body.errors) {
      throw body.errors[0];
    }
    return {
      status: result.status,
      body
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
        query
      };
    }
    throw {
      error: e,
      query
    };
  }
}
var removeEdgesAndNodes = (array) => {
  const final = array.edges.map((edge) => edge?.node);
  return final;
};
var reshapeCart = (cart) => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: "USD"
    };
  }
  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines)
  };
};
var reshapeCollection = (collection) => {
  if (!collection) {
    return void 0;
  }
  return {
    ...collection,
    path: `/search/${collection.handle}`
  };
};
var reshapeCollections = (collections) => {
  const reshapedCollections = [];
  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);
      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }
  return reshapedCollections;
};
var reshapeImages = (images, productTitle) => {
  const flattened = removeEdgesAndNodes(images);
  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};
var reshapeProduct = (product, filterHiddenProducts = true) => {
  const { images, variants, ...rest } = product;
  console.log("issue line: ", reshapeImages(images, product.title));
  return {
    ...rest,
    images: reshapeImages(images, product.title)
  };
};
var reshapeProducts = (products) => {
  const reshapedProducts = [];
  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);
      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }
  return reshapedProducts;
};
async function createCart() {
  const res = await shopifyFetch({
    query: createCartMutation,
    cache: "no-store"
  });
  return reshapeCart(res.body.data.cartCreate.cart);
}
async function addToCart(cartId, lines) {
  const res = await shopifyFetch({
    query: addToCartMutation,
    variables: {
      cartId,
      lines
    },
    cache: "no-store"
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}
async function removeFromCart(cartId, lineIds) {
  const res = await shopifyFetch({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds
    },
    cache: "no-store"
  });
  return reshapeCart(res.body.data.cartLinesRemove.cart);
}
async function updateCart(cartId, lines) {
  const res = await shopifyFetch({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines
    },
    cache: "no-store"
  });
  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}
async function getCart(cartId) {
  if (!cartId) {
    return void 0;
  }
  const res = await shopifyFetch({
    query: getCartQuery,
    variables: { cartId },
    tags: [TAGS.cart]
  });
  if (!res.body.data.cart) {
    return void 0;
  }
  return reshapeCart(res.body.data.cart);
}
async function getCollection(handle) {
  const res = await shopifyFetch({
    query: getCollectionQuery,
    tags: [TAGS.collections],
    variables: {
      handle
    }
  });
  return reshapeCollection(res.body.data.collection);
}
async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}) {
  const res = await shopifyFetch({
    query: getCollectionProductsQuery,
    tags: [TAGS.collections, TAGS.products],
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey
    }
  });
  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }
  return reshapeProducts(removeEdgesAndNodes(res.body.data.collection.products));
}
async function getCollections() {
  const res = await shopifyFetch({
    query: getCollectionsQuery,
    tags: [TAGS.collections]
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products"
      },
      path: "/search",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter((collection) => !collection.handle.startsWith("hidden"))
  ];
  return collections;
}
async function getMenu(handle) {
  const res = await shopifyFetch({
    query: getMenuQuery,
    tags: [TAGS.collections],
    variables: {
      handle
    }
  });
  return res.body?.data?.menu?.items.map((item) => ({
    title: item.title,
    path: item.url.replace(domain, "").replace("/collections", "/search").replace("/pages", "")
  })) || [];
}
async function deleteProduct(productID) {
  const res = await shopifyFetch({
    query: deleteProductMutation,
    variables: {
      input: {
        id: productID
      }
    }
  });
  const id = res.body.data.productDelete.deletedProductId;
  return id;
}
async function getProduct(handle) {
  const res = await shopifyFetch({
    query: getProductQuery,
    tags: [TAGS.products],
    variables: {
      handle
    }
  });
  return reshapeProduct(res.body.data.product, false);
}
async function getProductRecommendations(productId) {
  const res = await shopifyFetch({
    query: getProductRecommendationsQuery,
    tags: [TAGS.products],
    variables: {
      productId
    }
  });
  return reshapeProducts(res.body.data.productRecommendations);
}
async function getProducts({ query, reverse, sortKey }) {
  const res = await shopifyFetch({
    query: getProductsQuery,
    tags: [TAGS.products]
  });
  return removeEdgesAndNodes(res.body.data.products);
}
async function addProduct(variables) {
  const res = await fetch(adminEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminAccessToken
      // 'Shopify-Storefront-Private-Token': key,
    },
    body: JSON.stringify({
      query: addProductMutation,
      variables
    })
  });
  const body = await res.json();
  return body.data.productCreate.product.id;
}
export {
  addProduct,
  addToCart,
  createCart,
  deleteProduct,
  getCart,
  getCollection,
  getCollectionProducts,
  getCollections,
  getMenu,
  getProduct,
  getProductRecommendations,
  getProducts,
  removeFromCart,
  shopifyFetch,
  updateCart
};
//# sourceMappingURL=index.mjs.map