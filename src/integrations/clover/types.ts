// ============================================================
// Clover API Types
// ============================================================

export interface CloverCategory {
  id: string;
  name: string;
  sortOrder?: number;
  deleted?: boolean;
}

export interface CloverItem {
  id: string;
  name: string;
  alternateName?: string;
  code?: string;
  price: number; // integer cents
  priceType?: "FIXED" | "PER_UNIT" | "VARIABLE";
  defaultTaxRates?: boolean;
  taxRates?: CloverTaxRate[];
  modifierGroups?: { elements?: CloverModifierGroupRef[] };
  categories?: { elements?: CloverCategoryRef[] };
  tags?: { elements?: CloverTag[] };
  itemStock?: CloverItemStock;
  hidden?: boolean;
  available?: boolean;
  imageUrl?: string;
  description?: string;
}

export interface CloverCategoryRef {
  id: string;
  name?: string;
}

export interface CloverTag {
  id: string;
  name?: string;
}

export interface CloverItemStock {
  stockCount?: number;
  quantityOnHand?: number;
}

export interface CloverModifierGroupRef {
  id: string;
  name?: string;
}

export interface CloverModifierGroup {
  id: string;
  name: string;
  minRequired?: number;
  maxAllowed?: number;
  modifiers?: { elements?: CloverModifier[] };
}

export interface CloverModifier {
  id: string;
  name: string;
  alternateName?: string;
  price: number; // integer cents
  available?: boolean;
  modifierGroup?: { id: string };
}

export interface CloverTaxRate {
  id: string;
  name: string;
  rate: number; // thousandths of a percent: 870000 = 8.7%
  taxType?: string;
}

export interface CloverOrder {
  id: string;
  state?: string;
  total?: number; // cents
  title?: string;
  note?: string;
  lineItems?: { elements?: CloverLineItem[] };
  currency?: string;
  taxRemoved?: boolean;
  isDefault?: boolean;
  createdTime?: number;
  modifiedTime?: number;
}

export interface CloverLineItem {
  id: string;
  name?: string;
  price?: number; // cents
  quantity?: number;
  note?: string;
  alternateName?: string;
  modifications?: { elements?: CloverModification[] };
}

export interface CloverModification {
  id: string;
  name?: string;
  amount?: number; // cents
  modifier?: { id: string; name?: string };
}

export interface CloverMerchant {
  id: string;
  name: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  phoneNumber?: string;
  website?: string;
  timezone?: string;
  currency?: string;
}

export interface CloverApiResponse<T> {
  elements?: T[];
  href?: string;
  limit?: number;
  offset?: number;
}
