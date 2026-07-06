# CLOVER_INTEGRATION — Technical Reference

Technical architecture guide detailing the Clover online ordering and payment flow, webhook handling, and server-side operations.

## 1. System Architecture

```mermaid
graph TD
  Customer[Client Browser] -->|Fill Details & Card| CardIframe[Clover Iframe Elements]
  CardIframe -->|Tokenize Card| CloverEcomServer[Clover Ecom SDK]
  CloverEcomServer -->|Return Single-use Token| Customer
  Customer -->|Place Order + Token| NextServer[Next.js App Server]
  NextServer -->|Create V3 Order| CloverREST[Clover REST V3 API]
  NextServer -->|Charge Token on Order| CloverEcom[Clover Ecom API /v1/orders/{id}/pay]
  CloverEcom -->|Capture Payment Success| NextServer
  NextServer -->|Save Transaction| DB[Supabase / Local DB Fallback]
  CloverREST -->|Push Status Event| Webhook[Webhook Handler]
  Webhook -->|Update Status| DB
```

## 2. API Endpoints

### 1. Checkout Preview (`POST /api/clover/checkout-preview`)
- **Method**: Client-to-Server
- **Purpose**: Calculates Clover-authoritative taxes, fees, and final order totals.
- **Workflow**:
  1. Validates cart payload using Zod.
  2. Resolves local menu items to verify their `cloverItemId` and availability.
  3. Creates a temporary draft order: `POST /v3/merchants/{mId}/orders`.
  4. Appends line items and selected modifier IDs.
  5. Retrieves calculations: `GET /v3/merchants/{mId}/orders/{id}?expand=...`.
  6. Deletes the draft order: `DELETE /v3/merchants/{mId}/orders/{id}`.
  7. Returns subtotal, calculated taxes, tips, and final totals.
  8. If Clover prices differ from local cart seed prices, returns a warning flag.

### 2. Place Order (`POST /api/clover/place-order`)
- **Method**: Client-to-Server
- **Purpose**: Validates cart, tokenizes, creates a production Clover order, captures funds, and saves checkout receipt.
- **Workflow**:
  1. Implements a 2-second client IP rate limiter.
  2. Runs idempotency check using client-side UUID reference.
  3. Verifies item catalog mappings.
  4. Creates final Clover order with a detailed kitchen print ticket note.
  5. Appends all line items and modifiers.
  6. Captures payment by submitting the iframe card token to Clover SCL API: `POST /v1/orders/{orderId}/pay`.
  7. If transaction succeeds, updates database record to `PAID`.
  8. If transaction fails, marks record as `FAILED` and returns error code.

### 3. Clover Webhooks (`POST /api/webhooks/clover`)
- **Method**: Clover-to-Server
- **Purpose**: Processes asynchronous notifications.
- **Workflow**:
  1. GET handler responds with `verificationCode` to verify endpoint ownership in Clover Developer Console.
  2. POST handler computes HMAC SHA-256 signature using `CLOVER_WEBHOOK_SECRET` over raw body to verify origin.
  3. Deduplicates events using a warm memory cache.
  4. Fetches the modified order details from Clover API and updates status inside database.

## 3. Database Fallback Routine (`src/lib/db.ts`)
- If Supabase environment credentials (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are present, the app reads and writes orders directly to Postgres tables (`orders`, `order_items`, etc.).
- If credentials are missing, it falls back to writing order receipts to `scratch/db_orders.json`. This ensures the application remains fully functional and testable in local sandbox mode without requiring database configuration.
