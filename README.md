# Old Damascus Mediterranean Restaurant Website

Production-ready, responsive, and bilingual web application built with Next.js 16 (App Router), TypeScript, and Tailwind CSS. Integrated with Clover POS APIs for menu synchronizing and hosted checkout, and Supabase for database schemas.

## 🚀 Key Features

1. **Menu & Ordering Architecture**
   - Direct integration with Clover API.
   - Dual fallback mode: runs on local seed menu data if credentials are not configured.
   - Global shopping cart using Zustand (with localStorage persistence).
   - Rich support for item modifiers, custom notes, and guest checkout options.
2. **Premium Design System**
   - Custom fonts: Playfair Display, Manrope, Noto Kufi Arabic.
   - Styled using custom CSS variables (brand colors, elegant animations, responsive components).
   - RTL/Arabic localized headings and text options.
3. **Checkout & APIs**
   - Clover Hosted Checkout integration redirecting users to Clover's secure checkout page.
   - API endpoints for Catering submissions and Contact forms with bot honeypot validation.
   - Setup for webhook handlers verifying transactions.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS
- **State Management**: Zustand
- **Database**: Supabase
- **Payments**: Clover eCommerce REST APIs
- **Client Forms**: React Hook Form, Zod

## 📁 Repository Structure
```
old-damascus/
├── src/
│   ├── app/                 # Next.js pages & API routes
│   ├── components/          # Reusable UI, Layout, Cart drawers
│   ├── config/              # Central configuration (branding, toggles)
│   ├── data/                # Fallback menu seeds & asset maps
│   ├── integrations/        # Clover connection handlers & types
│   ├── lib/                 # Utility functions & helpers
│   ├── services/            # Menu provider services
│   └── store/               # Zustand global store files
├── supabase/
│   └── schema.sql           # Database setup SQL
├── DATA_TODO.md             # Launch requirements checklist
├── MENU_SOURCE_REPORT.md    # Source details for menu pricing
├── ASSET_MATCH_REPORT.md    # File matching details for food items
├── CLOVER_INTEGRATION.md    # API architecture documentation
├── CLOVER_SETUP_CHECKLIST.md# Onboarding setup checklist
└── DEPLOYMENT.md            # Vercel & database hosting setup
```

## ⚙️ Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in Supabase and Clover credentials. If left blank, the app runs automatically in Local Seed Fallback mode.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```
