"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

function generateId(): string {
  // Simple uuid fallback without import
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (
    item: Omit<CartItem, "cartItemId" | "quantity">,
    quantity?: number
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed (derived)
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          // Check if identical item+modifiers already in cart
          const existing = state.items.find(
            (c) =>
              c.menuItemId === item.menuItemId &&
              JSON.stringify(c.selectedModifiers) ===
                JSON.stringify(item.selectedModifiers) &&
              c.specialInstructions === item.specialInstructions
          );

          if (existing) {
            return {
              items: state.items.map((c) =>
                c.cartItemId === existing.cartItemId
                  ? { ...c, quantity: c.quantity + quantity }
                  : c
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              { ...item, cartItemId: generateId(), quantity },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((c) => c.cartItemId !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((c) =>
            c.cartItemId === cartItemId ? { ...c, quantity } : c
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => {
          const modifierTotal = item.selectedModifiers.reduce(
            (ms, m) => ms + m.additionalPrice,
            0
          );
          return sum + (item.price + modifierTotal) * item.quantity;
        }, 0),
    }),
    {
      name: "old-damascus-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
