// ============================================================
// Core Menu Types
// ============================================================

export type MenuItemSource =
  | "clover"
  | "client"
  | "doordash"
  | "uber-eats"
  | "seed";

export interface Modifier {
  id: string;
  cloverModifierId?: string;
  name: string;
  additionalPrice: number;
  available: boolean;
}

export interface ModifierGroup {
  id: string;
  cloverModifierGroupId?: string;
  name: string;
  required: boolean;
  minimumSelections: number;
  maximumSelections: number;
  modifiers: Modifier[];
}

export interface MenuCategory {
  id: string;
  cloverCategoryId?: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  available: boolean;
}

export interface MenuItem {
  id: string;
  cloverItemId?: string;
  slug: string;
  name: string;
  description: string;
  price: number; // USD float, e.g. 23.99
  categoryId: string;
  categoryName: string;
  image: string; // Deprecated or mapped backward compatibility
  primaryImage?: string;
  images?: string[];
  available: boolean;
  orderable?: boolean;
  featured?: boolean;
  popular?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy?: boolean;
  halal?: boolean;
  modifierGroups?: ModifierGroup[];
  source: MenuItemSource;
  lastVerifiedAt?: string;
  cloverModifierGroupIds?: string[];
  cloverModifierIds?: string[];
  cloverPrice?: number;
  cloverAvailable?: boolean;
  cloverLastSyncedAt?: string;
}

// ============================================================
// Cart Types
// ============================================================

export interface CartModifierSelection {
  groupId: string;
  groupName: string;
  modifierId: string;
  modifierName: string;
  additionalPrice: number;
}

export interface CartItem {
  cartItemId: string; // unique per cart entry (uuid)
  menuItemId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedModifiers: CartModifierSelection[];
  specialInstructions?: string;
  categoryName: string;
}

// ============================================================
// Order Types
// ============================================================

export type OrderType = "pickup" | "delivery";

export type OrderStatus =
  | "DRAFT"
  | "VALIDATING"
  | "AWAITING_PAYMENT"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "SUBMITTED_TO_CLOVER"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "VOIDED";

export interface DeliveryAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  instructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  cloverOrderId?: string;
  cloverPaymentId?: string;
  pickupTime?: string;
  deliveryAddress?: DeliveryAddress;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  currency?: string;
  errorCode?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  cloverItemId?: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: OrderItemModifier[];
  specialInstructions?: string;
}

export interface OrderItemModifier {
  modifierId: string;
  cloverModifierId?: string;
  name: string;
  additionalPrice: number;
}

// ============================================================
// Checkout Types
// ============================================================

export interface CheckoutCustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CheckoutPickupInfo {
  pickupTime: string;
  notes?: string;
}

export interface CheckoutDeliveryInfo {
  address: DeliveryAddress;
  requestedTime?: string;
}

export interface CheckoutSession {
  orderType: OrderType;
  customer: CheckoutCustomerInfo;
  pickup?: CheckoutPickupInfo;
  delivery?: CheckoutDeliveryInfo;
}
