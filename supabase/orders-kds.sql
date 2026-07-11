-- ============================================================
-- Old Damascus - Kitchen Display System (KDS) & POS Migration
-- ============================================================

-- 1. Add KDS tracking timestamps to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS preparing_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ready_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_ready_time TIMESTAMPTZ;

-- 2. Add POS & Source fields
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_source TEXT DEFAULT 'website', -- website, phone, walk_in, subscription, clover
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- 3. Modify Status Constraint (Implicitly handled if text, but good to document)
-- Statuses: NEW, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED
-- Payment Status: UNPAID, PAID, REFUNDED

-- 4. Enable Realtime for orders table
-- This allows the KDS to listen for changes without polling
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Note: Ensure Replica Identity is set to default or full so realtime broadcasts previous values if needed
ALTER TABLE public.orders REPLICA IDENTITY FULL;
