-- ============================================================
-- SQL Migration: Package Tracking & Employee Roles
-- Run this script in the Supabase SQL Editor if schema is existing
-- ============================================================

-- 1. Add role to profiles table for strict server-side RBAC
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- 2. Add user and Clover transaction links to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS clover_order_id TEXT,
ADD COLUMN IF NOT EXISTS clover_payment_id TEXT,
ADD COLUMN IF NOT EXISTS package_id TEXT,
ADD COLUMN IF NOT EXISTS is_employee_package BOOLEAN DEFAULT FALSE;

-- Create indexes for quick customer/employee account lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_clover_order ON public.subscriptions(clover_order_id);

-- 3. Add Clover POS accounting ticket tracking to meal_checkins
ALTER TABLE public.meal_checkins 
ADD COLUMN IF NOT EXISTS clover_order_id TEXT;
CREATE INDEX IF NOT EXISTS idx_meal_checkins_clover_order ON public.meal_checkins(clover_order_id);
