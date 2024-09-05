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
export {
  getMenuQuery
};
//# sourceMappingURL=menu.mjs.map