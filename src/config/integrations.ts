// ============================================================
// Integration Feature Flags
// Non-secret flags that control integration behavior.
// All secrets come from environment variables.
// ============================================================

export const integrations = {
  // Clover is enabled when all required env vars are present
  cloverEnabled: !!(
    process.env.CLOVER_MERCHANT_ID && process.env.CLOVER_API_TOKEN
  ),

  // Direct ordering requires Clover to be configured
  directOrderingEnabled: !!(
    process.env.CLOVER_MERCHANT_ID &&
    process.env.CLOVER_API_TOKEN &&
    process.env.CLOVER_ECOMMERCE_PUBLIC_KEY
  ),

  // Pickup and delivery are configured in restaurant.ts
  pickupEnabled: true,
  deliveryEnabled: false, // disabled until confirmed by client

  // Guest checkout is always available
  guestCheckoutEnabled: true,

  // User accounts require Supabase
  userAccountsEnabled: !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),

  // Catering form always available
  cateringEnabled: true,

  // Email notifications require Resend
  emailEnabled: !!process.env.RESEND_API_KEY,
} as const;

export type Integrations = typeof integrations;
