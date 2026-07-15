// Safe analytics helper that fails silently if IDs are not configured.

// Define Gtag type since we are using window.gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type EventName =
  | "view_menu"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "package_inquiry_open"
  | "package_inquiry_submit"
  | "package_checkout_open"
  | "package_checkout_submit"
  | "catering_submit"
  | "call_click"
  | "doordash_click"
  | "ubereats_click"
  | "google_review_click"
  | "share_dish";

export function trackEvent(eventName: EventName, payload?: Record<string, unknown>) {
  try {
    const hasGA = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    const hasPixel = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);

    if (hasGA && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, payload);
    }

    if (hasPixel && typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", eventName, payload);
      // Map standard events to standard Pixel events if needed
      if (eventName === "add_to_cart") window.fbq("track", "AddToCart", payload);
      if (eventName === "view_item") window.fbq("track", "ViewContent", payload);
    }
  } catch (error) {
    // Fail silently so we don't disrupt user navigation
    console.debug("Analytics tracking failed silently:", error);
  }
}
