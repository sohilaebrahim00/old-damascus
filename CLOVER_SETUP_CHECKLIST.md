# CLOVER_SETUP_CHECKLIST — Merchant Onboarding

Operational step-by-step checklist to guide the restaurant client through their Clover developer dashboard configuration.

## Step 1: Register Clover Developer Account
1. Visit the [Clover Developer Portal](https://sandbox.dev.clover.com/) (Sandbox for testing) or [Clover Production Dashboard](https://www.clover.com/dashboard).
2. Create a merchant or developer account.

## Step 2: Create a Web App Integration
1. Navigate to **Your Apps** > **Create App**.
2. Set app type to **Web App**.
3. Choose the following permissions under **App Settings**:
   - [x] **Merchant Read/Write**
   - [x] **Inventory Read**
   - [x] **Orders Read/Write**
   - [x] **Customers Read/Write**

## Step 3: Retrieve Tokens
1. Go to your newly created App settings.
2. Note your **App ID** and **App Secret**.
3. Under **Web App settings**, locate your generated **API Token** (Clover REST Token) and your **Merchant ID**.
4. Retrieve eCommerce **Public & Private Keys** under **Account & Setup** > **eCommerce API Tokens**.

## Step 4: Configure Webhooks
1. Under **App Settings** > **Webhooks**, set your webhook URL to:
   `https://yourdomain.com/api/webhooks/clover`
2. Select notification event types:
   - [x] **Payments** (to receive confirmation updates)
   - [x] **Inventory** (optional, to keep stock counts up to date)

## Step 5: Fill Environment Variables
Inject the retrieved keys into your Vercel or production server environment settings:
```env
CLOVER_MERCHANT_ID=your_merchant_id
CLOVER_API_TOKEN=your_rest_api_token
CLOVER_ECOMMERCE_PUBLIC_KEY=your_pub_key
CLOVER_ECOMMERCE_PRIVATE_KEY=your_priv_key
```
