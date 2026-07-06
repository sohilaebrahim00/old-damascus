"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import type { MenuItem } from "@/types";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";

export function AddToCartSection({ item }: { item: MenuItem }) {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, string>
  >({});
  const { addItem } = useCartStore();

  const modifierTotal = Object.entries(selectedModifiers).reduce(
    (sum, [groupId, modId]) => {
      const group = item.modifierGroups?.find((g) => g.id === groupId);
      const mod = group?.modifiers.find((m) => m.id === modId);
      return sum + (mod?.additionalPrice ?? 0);
    },
    0
  );

  const lineTotal = (item.price + modifierTotal) * quantity;

  const handleAdd = () => {
    const selections = Object.entries(selectedModifiers)
      .map(([groupId, modId]) => {
        const group = item.modifierGroups?.find((g) => g.id === groupId);
        const mod = group?.modifiers.find((m) => m.id === modId);
        if (!group || !mod) return null;
        return {
          groupId,
          groupName: group.name,
          modifierId: modId,
          modifierName: mod.name,
          additionalPrice: mod.additionalPrice,
        };
      })
      .filter((x): x is {
        groupId: string;
        groupName: string;
        modifierId: string;
        modifierName: string;
        additionalPrice: number;
      } => x !== null);

    addItem(
      {
        menuItemId: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        image: item.image,
        selectedModifiers: selections,
        specialInstructions: specialInstructions || undefined,
        categoryName: item.categoryName,
      },
      quantity
    );
  };

  if (!item.available) {
    return (
      <div className="p-6 bg-cream rounded-2xl border border-border text-center">
        <p className="text-olive font-semibold">
          This item is currently unavailable.
        </p>
        <p className="text-sm text-olive mt-1">
          Please check back later or call the restaurant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Modifier Groups */}
      {item.modifierGroups?.map((group) => (
        <div key={group.id}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-olive-dark">
              {group.name}
            </h3>
            {group.required && (
              <span className="text-xs text-error font-semibold">Required</span>
            )}
          </div>
          <div className="space-y-2">
            {group.modifiers.map((mod) => (
              <label
                key={mod.id}
                className="flex items-center justify-between p-3 bg-cream rounded-xl border border-border cursor-pointer hover:border-brand transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`group-${group.id}`}
                    value={mod.id}
                    checked={selectedModifiers[group.id] === mod.id}
                    onChange={() =>
                      setSelectedModifiers((prev) => ({
                        ...prev,
                        [group.id]: mod.id,
                      }))
                    }
                    className="accent-brand-dark"
                  />
                  <span className="text-sm text-olive-dark">{mod.name}</span>
                </div>
                {mod.additionalPrice > 0 && (
                  <span className="text-xs font-semibold text-brand-dark">
                    +{formatPrice(mod.additionalPrice)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Special Instructions */}
      <div>
        <label htmlFor="special-instructions" className="label">
          Special Instructions (optional)
        </label>
        <textarea
          id="special-instructions"
          rows={2}
          maxLength={200}
          placeholder="Any allergies, preferences, or notes..."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          className="input resize-none"
        />
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-cream transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold text-lg w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 hover:bg-cream transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button onClick={handleAdd} className="btn-primary btn-lg flex-1">
          <ShoppingBag className="w-5 h-5" />
          Add {quantity > 1 ? `${quantity}x ` : ""}to Cart — {formatPrice(lineTotal)}
        </button>
      </div>
    </div>
  );
}
