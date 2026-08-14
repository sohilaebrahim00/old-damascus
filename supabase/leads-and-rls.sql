-- ============================================================
-- Integration audit fixes
--
-- 1. Creates the `leads` table that src/lib/lead-manager.ts writes to.
--    It was never defined in any migration, so every contact, catering
--    and package-inquiry submission failed its insert.
--
-- 2. Enables row level security on the tables that hold customer data.
--    These were readable and writable by anyone holding the anon key —
--    which ships in the browser bundle.
--
-- Safe to re-run.
-- ============================================================

-- ---- Leads (contact / catering / package inquiries) ----
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,                 -- contact | catering | package_inquiry
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  package_id TEXT,
  event_date TEXT,
  guest_count TEXT,
  source TEXT DEFAULT 'website',
  handled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_type ON public.leads(type);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_checkins ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may submit a lead, but never read them back.
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone can submit a catering request" ON public.catering_requests;
CREATE POLICY "Anyone can submit a catering request" ON public.catering_requests
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_submissions;
CREATE POLICY "Anyone can submit a contact message" ON public.contact_submissions
  FOR INSERT WITH CHECK (TRUE);

-- Order detail follows the parent order: a guest sees only their own.
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert order items" ON public.order_items;
CREATE POLICY "System can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can view own order item modifiers" ON public.order_item_modifiers;
CREATE POLICY "Users can view own order item modifiers" ON public.order_item_modifiers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.id = order_item_modifiers.order_item_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert order item modifiers" ON public.order_item_modifiers;
CREATE POLICY "System can insert order item modifiers" ON public.order_item_modifiers
  FOR INSERT WITH CHECK (TRUE);

-- Subscriptions carry the QR redemption token: owner-only reads.
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Meal check-ins are staff-side only; no anon policy is granted, so only
-- the service role (server) can read or write them.

-- ============================================================
-- NOTE: server-side writes must use SUPABASE_SERVICE_ROLE_KEY.
-- With only the anon key, the policies above will block order reads and
-- status updates, leaving paid orders stranded as UNPAID.
-- ============================================================
