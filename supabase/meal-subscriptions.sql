-- Meal Plan Subscriptions Schema

CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_code text UNIQUE NOT NULL, -- e.g., OD-1001
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  package_id text, -- e.g. 'one-meal-daily', 'two-meals-daily'
  package_type text NOT NULL, -- 'one_meal_daily' or 'two_meals_daily'
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  meals_per_day integer NOT NULL, -- 1 or 2
  qr_code_token text UNIQUE NOT NULL,
  payment_status text DEFAULT 'pending', -- 'paid', 'pending', 'unpaid'
  payment_method text, -- 'cash', 'clover_manual', 'phone', 'other'
  clover_order_id text,
  clover_payment_id text,
  is_employee_package boolean DEFAULT false,
  notes text,
  payment_reference text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE meal_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  checkin_date date NOT NULL,
  meal_number integer NOT NULL, -- 1 or 2
  served_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  served_by text,
  clover_order_id text,
  notes text,
  UNIQUE(subscription_id, checkin_date, meal_number) -- Prevent duplicate check-ins
);

-- Indexes for fast lookup
CREATE INDEX idx_subscriptions_code ON subscriptions(subscription_code);
CREATE INDEX idx_subscriptions_phone ON subscriptions(customer_phone);
CREATE INDEX idx_subscriptions_name ON subscriptions(customer_name);
CREATE INDEX idx_subscriptions_qr_token ON subscriptions(qr_code_token);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_meal_checkins_date ON meal_checkins(checkin_date);
