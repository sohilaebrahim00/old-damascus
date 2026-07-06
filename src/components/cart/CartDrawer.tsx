"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { restaurant } from "@/config/restaurant";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotalItems } =
    useCartStore();

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl
                    flex flex-col transition-transform duration-300 ease-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-brand-dark" />
            <h2 className="font-heading text-xl font-semibold text-olive-dark">
              Your Order
            </h2>
            {totalItems > 0 && (
              <span className="bg-brand-dark text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-cream transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-border" />
              </div>
              <div>
                <p className="font-heading text-lg font-medium text-olive-dark">
                  Your cart is empty
                </p>
                <p className="text-sm text-olive mt-1">
                  Add some delicious dishes from our menu
                </p>
              </div>
              <Link
                href="/menu"
                onClick={closeCart}
                className="btn-primary btn-sm"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const modTotal = item.selectedModifiers.reduce(
                  (s, m) => s + m.additionalPrice,
                  0
                );
                const lineTotal = (item.price + modTotal) * item.quantity;

                return (
                  <li key={item.cartItemId} className="p-5 flex gap-4">
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-cream">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/menu/placeholder.jpg";
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-olive-dark line-clamp-1">
                        {item.name}
                      </p>
                      {item.selectedModifiers.length > 0 && (
                        <p className="text-xs text-olive mt-0.5 line-clamp-2">
                          {item.selectedModifiers
                            .map((m) => m.modifierName)
                            .join(", ")}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs text-olive italic mt-0.5 line-clamp-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}

                      {/* Qty controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity - 1)
                            }
                            className="p-1.5 hover:bg-cream transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.cartItemId, item.quantity + 1)
                            }
                            className="p-1.5 hover:bg-cream transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-brand-dark">
                            {formatPrice(lineTotal)}
                          </span>
                          <button
                            onClick={() => removeItem(item.cartItemId)}
                            className="p-1.5 rounded-lg text-error hover:bg-red-50 transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4 bg-cream/60">
            <div className="flex justify-between text-sm">
              <span className="text-olive">Subtotal</span>
              <span className="font-bold text-olive-dark">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs text-olive">
              Tax and delivery fee calculated at checkout.
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full justify-center"
            >
              Proceed to Checkout
            </Link>

            <div className="flex gap-3">
              <a
                href={restaurant.doordashUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-sm flex-1 text-center"
              >
                DoorDash
              </a>
              <a
                href={restaurant.uberEatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-sm flex-1 text-center"
              >
                Uber Eats
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
