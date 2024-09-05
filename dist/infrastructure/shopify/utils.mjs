// src/infrastructure/shopify/utils.ts
var ensureStartsWith = (stringToCheck, startsWith) => stringToCheck.startsWith(startsWith) ? stringToCheck : `${startsWith}${stringToCheck}`;
var validateEnvironmentVariables = () => {
  const requiredEnvironmentVariables = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_STOREFRONT_ACCESS_TOKEN"];
  const missingEnvironmentVariables = [];
  requiredEnvironmentVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvironmentVariables.push(envVar);
    }
  });
  if (missingEnvironmentVariables.length) {
    throw new Error(
      `The following environment variables are missing. Your site will not work without them. Read more: https://vercel.com/docs/integrations/shopify#configure-environment-variables

${missingEnvironmentVariables.join(
        "\n"
      )}
`
    );
  }
  if (process.env.SHOPIFY_STORE_DOMAIN?.includes("[") || process.env.SHOPIFY_STORE_DOMAIN?.includes("]")) {
    throw new Error(
      "Your `SHOPIFY_STORE_DOMAIN` environment variable includes brackets (ie. `[` and / or `]`). Your site will not work with them there. Please remove them."
    );
  }
};
export {
  ensureStartsWith,
  validateEnvironmentVariables
};
//# sourceMappingURL=utils.mjs.map