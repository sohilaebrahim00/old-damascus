export interface Subscription {
  id: string;
  subscription_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  package_type: string;
  start_date: string;
  end_date: string;
  status: string; // 'active', 'expired', 'cancelled'
  meals_per_day: number;
  qr_code_token: string;
  payment_status: string; // 'paid', 'pending', 'unpaid'
  payment_method?: string | null; // 'cash', 'clover_manual', 'phone', 'other'
  notes?: string | null;
  payment_reference?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealCheckin {
  id: string;
  subscription_id: string;
  checkin_date: string;
  meal_number: number;
  served_at: string;
  served_by?: string | null;
  notes?: string | null;
}
