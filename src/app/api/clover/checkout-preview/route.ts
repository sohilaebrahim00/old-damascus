import { NextResponse } from "next/server";
import { z } from "zod";
import { isCloverCheckoutConfigured } from "@/integrations/clover/config";
import { getMenuItems } from "@/services/menu.service";
import {
  createCloverOrder,
  addCloverLineItem,
  addCloverModification,
  getCloverOrderDetails,
  deleteCloverOrder,
} from "@/integrations/clover/orders";

const previewSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().int().min(1),
        selectedModifiers: z.array(
          z.object({
            modifierId: z.string(),
          })
        ),
      })
    )
    .min(1),
  orderType: z.enum(["pickup", "delivery"]),
  tipAmount: z.number().min(0).optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Check if Clover checkout is configured
    if (!isCloverCheckoutConfigured()) {
      return NextResponse.json(
        {
          error: "Clover checkout is not configured.",
          code: "CLOVER_NOT_CONFIGURED",
        },
        { status: 400 }
      );
    }

    // 2. Parse and validate input
    const body = await req.json();
    const result = previewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: result.error.format() },
        { status: 400 }
      );
    }

    const { items: cartItems, orderType, tipAmount = 0 } = result.data;

    // 3. Resolve local items and modifiers against database/seed
    const { items: allMenuItems } = await getMenuItems();
    const verifiedItemsToCreate = [];
    let localSubtotal = 0;

    for (const cartItem of cartItems) {
      const menuItem = allMenuItems.find((i) => i.id === cartItem.menuItemId);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Item not found in menu: ${cartItem.menuItemId}` },
          { status: 400 }
        );
      }

      if (!menuItem.available) {
        return NextResponse.json(
          { error: `Item is currently unavailable: ${menuItem.name}` },
          { status: 400 }
        );
      }

      const cloverItemId = menuItem.cloverItemId;
      if (!cloverItemId) {
        return NextResponse.json(
          { error: `Item is not mapped to Clover inventory: ${menuItem.name}` },
          { status: 400 }
        );
      }

      // Track local price sum for comparison
      let itemLocalPrice = menuItem.price;

      // Map modifiers
      const resolvedModifierIds: string[] = [];
      for (const selMod of cartItem.selectedModifiers) {
        let foundMod = null;
        if (menuItem.modifierGroups) {
          for (const group of menuItem.modifierGroups) {
            const mod = group.modifiers.find((m) => m.id === selMod.modifierId);
            if (mod) {
              foundMod = mod;
              break;
            }
          }
        }

        if (!foundMod || !foundMod.cloverModifierId) {
          return NextResponse.json(
            { error: `Modifier not found or unmapped: ${selMod.modifierId}` },
            { status: 400 }
          );
        }

        resolvedModifierIds.push(foundMod.cloverModifierId);
        itemLocalPrice += foundMod.additionalPrice;
      }

      localSubtotal += itemLocalPrice * cartItem.quantity;

      verifiedItemsToCreate.push({
        cloverItemId,
        quantity: cartItem.quantity,
        cloverModifierIds: resolvedModifierIds,
      });
    }

    // 4. Create a draft Clover order for calculation
    const cloverOrder = await createCloverOrder(orderType, "Preview Draft Order");
    const orderId = cloverOrder.id;

    try {
      // 5. Add line items and modifiers to draft order
      for (const item of verifiedItemsToCreate) {
        for (let q = 0; q < item.quantity; q++) {
          const lineItem = await addCloverLineItem(orderId, item.cloverItemId);
          for (const modId of item.cloverModifierIds) {
            await addCloverModification(orderId, lineItem.id, modId);
          }
        }
      }

      // 6. Fetch full details (let Clover compute tax and totals)
      const details = await getCloverOrderDetails(orderId);

      // Clover returns values in integer cents
      // Clover returns values in integer cents
      
      // Calculate Clover subtotal and tax
      let computedSubtotal = 0;
      let computedTax = 0;

      if (details.lineItems?.elements) {
        for (const li of details.lineItems.elements) {
          computedSubtotal += li.price ?? 0;
          if (li.modifications?.elements) {
            for (const mod of li.modifications.elements) {
              computedSubtotal += mod.amount ?? 0;
            }
          }
        }
      }

      // In Clover, order tax is usually computed from item tax rates
      // Let's compute it from total minus subtotal if not explicit
      const orderTotalCents = details.total ?? 0;
      computedTax = Math.max(0, orderTotalCents - computedSubtotal);

      const subtotalUsd = computedSubtotal / 100;
      const taxUsd = computedTax / 100;
      const tipUsd = tipAmount;
      const totalUsd = subtotalUsd + taxUsd + tipUsd;

      // 7. Clean up draft order immediately
      await deleteCloverOrder(orderId);

      // Compare pricing
      const priceDifference = Math.abs(subtotalUsd - localSubtotal);
      const priceChanged = priceDifference > 0.05; // allow small rounding diffs

      return NextResponse.json({
        success: true,
        summary: {
          subtotal: subtotalUsd,
          tax: taxUsd,
          tip: tipUsd,
          total: totalUsd,
        },
        priceChanged,
      });
    } catch (err) {
      // Always attempt to delete the draft order in case of failure
      try {
        await deleteCloverOrder(orderId);
      } catch {}
      throw err;
    }
  } catch (err) {
    console.error("[Checkout Preview Error]:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Checkout calculation failed on Clover.",
      },
      { status: 500 }
    );
  }
}
