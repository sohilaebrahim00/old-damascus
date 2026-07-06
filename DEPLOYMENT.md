# DEPLOYMENT — Hosting Setup

Guide detailing Supabase, Vercel, DNS, and Production domain configurations.

## 1. Supabase Setup
1. Create a new database project on [Supabase Console](https://supabase.com/).
2. Open the **SQL Editor** in the database dashboard.
3. Paste and run the contents of `/supabase/schema.sql`.
4. Copy your project connection strings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, do not expose)

## 2. Vercel Deployment
1. Connect your Git repository to [Vercel](https://vercel.com).
2. Choose **Next.js** framework settings.
3. Configure all variables from `.env.example` in Vercel's **Environment Variables** panel:
   - Supabase keys
   - Clover credentials (leave blank for local demo fallback simulation)
   - Integration toggles
4. Run deployment.

## 3. Production Domain & DNS
1. Under Vercel project **Settings** > **Domains**, add `olddamascustx.com`.
2. Update CNAME and A-records at your domain registrar (e.g. GoDaddy, Namecheap) pointing to Vercel's namespace servers.
3. Configure SSL (Vercel generates SSL certificates automatically).

## 4. Email Setup (Resend)
1. Register on [Resend](https://resend.com/).
2. Verify your custom domain `olddamascustx.com` by adding DKIM records to DNS.
3. Generate a Resend token and add `RESEND_API_KEY` to Vercel variables.
