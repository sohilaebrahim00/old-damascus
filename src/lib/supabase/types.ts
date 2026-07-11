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

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_type: string; // 'pickup', 'delivery', 'dine_in'
  status: string; // 'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'
  payment_status: string; // 'UNPAID', 'PAID', 'REFUNDED'
  subtotal_cents: number;
  tax_cents: number;
  tip_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  clover_order_id?: string | null;
  clover_payment_id?: string | null;
  pickup_time?: string | null;
  delivery_address?: Record<string, unknown>;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  
  // KDS & POS additions
  accepted_at?: string | null;
  preparing_at?: string | null;
  ready_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  estimated_ready_time?: string | null;
  
  order_source?: string; // 'website', 'phone', 'walk_in', 'subscription', 'clover'
  payment_reference?: string | null;
  transaction_id?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id?: string | null;
  clover_item_id?: string | null;
  name: string;
  price_cents: number;
  quantity: number;
  special_instructions?: string | null;
  created_at: string;
  modifiers?: OrderItemModifier[];
}

export interface OrderItemModifier {
  id: string;
  order_item_id: string;
  modifier_id?: string | null;
  clover_modifier_id?: string | null;
  name: string;
  additional_price_cents: number;
}
