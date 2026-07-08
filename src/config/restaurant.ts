// ============================================================
// Centralized Restaurant Configuration
// All public restaurant data lives here — no duplicates.
// ============================================================

export const restaurant = {
  name: "Old Damascus Mediterranean Restaurant",
  shortName: "Old Damascus",
  tagline: "Authentic Arabic Cuisine",
  description:
    "Experience the warmth and flavors of Damascus through freshly prepared grills, shawarma, mandi, mezze, family platters, desserts, and traditional drinks.",

  phone: "+1 469-728-5635",
  phoneRaw: "+14697285635",
  phoneUrl: "tel:+14697285635",
  email: "info@olddamascustx.com",

  address: {
    street: "1310 W Campbell Rd #108",
    city: "Richardson",
    state: "TX",
    zip: "75080",
    country: "United States",
    full: "1310 W Campbell Rd #108, Richardson, TX 75080",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Old+Damascus+Mediterranean+Restaurant+1310+W+Campbell+Rd+Richardson+TX",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=1310+W+Campbell+Rd+%23108+Richardson+TX+75080",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3344.9!2d-96.7399!3d32.9733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOld+Damascus!5e0!3m2!1sen!2sus!4v1700000000000",
  },

  // [DATA_TODO] Opening hours must be confirmed by the client before production launch.
  hours: [
    { days: "Sunday – Thursday", open: "11:00 AM", close: "9:00 PM" },
    { days: "Friday – Saturday", open: "11:00 AM", close: "10:00 PM" },
  ],

  // External ordering
  doordashUrl:
    "https://www.doordash.com/store/25215659?utm_source=mx_share&aw=no6SvdnHKTHna7Dt",
  uberEatsUrl:
    "https://www.ubereats.com/store-browse-uuid/808474cc-095e-4fa4-845b-6dec8434d217?diningMode=DELIVERY",

  // Reviews
  googleReviewUrl: "https://g.page/r/CSL54Z45HjXmEAE/review",

  // Social media
  // [DATA_TODO] Social media URLs must be provided by the client before production launch.
  social: {
    facebook: "TO_BE_PROVIDED_BY_CLIENT",
    instagram: "TO_BE_PROVIDED_BY_CLIENT",
    tiktok: "TO_BE_PROVIDED_BY_CLIENT",
    youtube: "TO_BE_PROVIDED_BY_CLIENT",
  },

  // Currency
  currency: "USD",
  currencySymbol: "$",
  locale: "en-US",

  // SEO
  seo: {
    titleTemplate: "%s | Old Damascus – Mediterranean Restaurant in Richardson, TX",
    defaultTitle:
      "Old Damascus | Mediterranean Restaurant in Richardson, TX",
    defaultDescription:
      "Discover authentic Mediterranean cuisine at Old Damascus in Richardson, Texas. Browse our menu and order directly, through DoorDash, or through Uber Eats.",
    keywords: [
      "Mediterranean restaurant Richardson TX",
      "Mediterranean food Richardson",
      "Arabic restaurant near me",
      "halal restaurant Richardson Texas",
      "shawarma Richardson TX",
      "mandi Richardson TX",
      "Old Damascus restaurant",
    ],
    cuisineTypes: [
      "Mediterranean",
      "Middle Eastern",
      "Arabic",
      "Halal",
    ],
  },

  // Catering
  catering: {
    enabled: true,
    minGuests: 10,
    requiresAdvanceNotice: true,
    advanceNoticeDays: 3,
    eventTypes: [
      "Family Gathering",
      "Corporate Lunch",
      "Office Event",
      "Birthday Celebration",
      "Baby Shower",
      "Wedding",
      "Private Celebration",
      "Community Event",
      "Other",
    ],
    budgetRanges: [
      "Under $500",
      "$500 – $1,000",
      "$1,000 – $2,500",
      "$2,500 – $5,000",
      "$5,000+",
      "Not sure yet",
    ],
  },

  // Pickup
  pickup: {
    enabled: true,
    // [DATA_TODO] Preparation time must be confirmed by the restaurant.
    estimatedMinutes: null as number | null,
  },

  // Delivery
  // [DATA_TODO] Delivery settings must be confirmed by the client before enabling.
  delivery: {
    enabled: false,
    minimumOrderCents: 0,
    feeCents: 0,
    freeDeliveryThresholdCents: 0,
    estimatedMinutes: null as number | null,
    allowedZipCodes: [] as string[],
  },
} as const;

export type Restaurant = typeof restaurant;
