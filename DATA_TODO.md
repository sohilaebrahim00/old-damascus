# DATA_TODO — Old Damascus Launch Plan

List of information and credentials that the client must confirm or provide before the site goes live.

## 1. Clover API Credentials
The site uses official Clover APIs to load real inventory items and process payments. Provide the following sandbox (for testing) and production (for live) values:

- [ ] `CLOVER_MERCHANT_ID` — Your Clover merchant account number.
- [ ] `CLOVER_API_TOKEN` — Generated token under Clover Web App integration permissions.
- [ ] `CLOVER_ECOMMERCE_PUBLIC_KEY` — Public eCommerce key for hosted checkout styling.
- [ ] `CLOVER_ECOMMERCE_PRIVATE_KEY` — Private eCommerce key for processing payments.
- [ ] `CLOVER_HOSTED_CHECKOUT_PAGE_CONFIG_UUID` — Config UUID from your Clover Hosted Checkout setup.

## 2. Restaurant Content & Details
- [ ] **Opening Hours Confirmation** — Sunday–Thursday 11 AM–9 PM, Friday–Saturday 11 AM–10 PM. Confirm if these hours are fully correct.
- [ ] **Catering Delivery Radius & Charges** — Confirm minimum orders, fees, or allowed ZIP codes if direct delivery is enabled.
- [ ] **Contact Email** — Confirm if `info@olddamascustx.com` is active and correct.
- [ ] **Social Media Links** — Provide link URLs for:
  - Facebook
  - Instagram
  - TikTok
  - YouTube

## 3. Media Assets
- [ ] **High-Resolution Logo** — Provide official white and transparent versions of the logo.
- [ ] **Food Images** — Provide images for all menu items:
  - Shish Tawook Plate
  - Beef Kofta Kebab
  - Mandi Plates
  - Hummus & Salads
  - Baklawa & smoothies

## 4. Production Domain
- [ ] **Domain Name** — Provide registered domain name (e.g. `olddamascustx.com`) to setup DNS and configure Resend email keys.
- [ ] **Resend API Key** — For sending transaction/catering emails to customers.
