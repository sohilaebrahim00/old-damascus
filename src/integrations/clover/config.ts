// ============================================================
// Clover Configuration
// All values come from environment variables — never hardcoded.
// ============================================================

export const CLOVER_ENVIRONMENTS = {
  sandbox: {
    apiBase: "https://sandbox.dev.clover.com",
    ecomBase: "https://scl-sandbox.dev.clover.com",
  },
  production: {
    apiBase: "https://api.clover.com",
    ecomBase: "https://scl.clover.com",
  },
} as const;

export type CloverEnvironment = keyof typeof CLOVER_ENVIRONMENTS;

export function getCloverConfig() {
  const env =
    (process.env.CLOVER_ENV as CloverEnvironment) ||
    (process.env.CLOVER_ENVIRONMENT as CloverEnvironment) ||
    "sandbox";
  const urls = CLOVER_ENVIRONMENTS[env] || CLOVER_ENVIRONMENTS.sandbox;

  return {
    environment: env,
    merchantId: process.env.CLOVER_MERCHANT_ID || "",
    apiToken:
      process.env.CLOVER_ACCESS_TOKEN ||
      process.env.CLOVER_API_TOKEN ||
      "",
    appId: process.env.CLOVER_APP_ID || "",
    appSecret: process.env.CLOVER_APP_SECRET || "",
    ecomPublicKey:
      process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN ||
      process.env.NEXT_PUBLIC_CLOVER_PUBLIC_KEY ||
      process.env.CLOVER_ECOMMERCE_PUBLIC_KEY ||
      "",
    ecomPrivateKey:
      process.env.CLOVER_PRIVATE_TOKEN ||
      process.env.CLOVER_PRIVATE_KEY ||
      process.env.CLOVER_ECOMMERCE_PRIVATE_KEY ||
      "",
    hostedCheckoutPageConfigUuid:
      process.env.CLOVER_HOSTED_CHECKOUT_PAGE_CONFIG_UUID || "",
    webhookSecret: process.env.CLOVER_WEBHOOK_SECRET || "",
    pickupOrderTypeId: process.env.CLOVER_PICKUP_ORDER_TYPE_ID || "",
    deliveryOrderTypeId: process.env.CLOVER_DELIVERY_ORDER_TYPE_ID || "",
    defaultTaxId: process.env.CLOVER_DEFAULT_TAX_ID || "",
    defaultDeviceId: process.env.CLOVER_DEFAULT_DEVICE_ID || "",
    appUrl:
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000",
    returnUrl:
      process.env.CLOVER_RETURN_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/order-success`,
    cancelUrl:
      process.env.CLOVER_CANCEL_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cart`,
    apiBase: urls.apiBase,
    ecomBase: urls.ecomBase,
  };
}

export function isCloverConfigured(): boolean {
  const cfg = getCloverConfig();
  return !!(cfg.merchantId && cfg.apiToken);
}

export function isCloverCheckoutConfigured(): boolean {
  const cfg = getCloverConfig();
  return !!(cfg.merchantId && cfg.apiToken && cfg.ecomPrivateKey && cfg.ecomPublicKey);
}
