// ============================================================
// Order notifications (Resend)
//
// Two messages go out when a pickup order is paid:
//   1. Customer confirmation — order number, items, total, pickup info
//   2. Restaurant alert     — new order, customer details, items, total
//
// Both are best-effort. A mail failure must never fail an order that has
// already been charged, so every path here swallows and logs.
//
// Activates automatically once RESEND_API_KEY is set; until then it logs
// what it would have sent and returns.
// ============================================================

import { restaurant } from "@/config/restaurant";

export interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
  totalCents: number;
  notes?: string;
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemRows(items: OrderEmailPayload["items"]): string {
  return items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #E9DDC7;">
            ${escapeHtml(i.name)}
            <span style="color:#68705F;">&times;${i.quantity}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #E9DDC7;text-align:right;white-space:nowrap;">
            ${money(Math.round(i.price * 100) * i.quantity)}
          </td>
        </tr>`
    )
    .join("");
}

function totalsBlock(o: OrderEmailPayload): string {
  return `
    <table style="width:100%;margin-top:16px;font-size:14px;">
      <tr><td style="padding:3px 0;color:#68705F;">Subtotal</td>
          <td style="padding:3px 0;text-align:right;">${money(o.subtotalCents)}</td></tr>
      <tr><td style="padding:3px 0;color:#68705F;">Tax</td>
          <td style="padding:3px 0;text-align:right;">${money(o.taxCents)}</td></tr>
      <tr><td style="padding:3px 0;color:#68705F;">Tip</td>
          <td style="padding:3px 0;text-align:right;">${money(o.tipCents)}</td></tr>
      <tr><td style="padding:10px 0 0;font-weight:700;border-top:1px solid #E9DDC7;">Total</td>
          <td style="padding:10px 0 0;text-align:right;font-weight:700;border-top:1px solid #E9DDC7;">${money(o.totalCents)}</td></tr>
    </table>`;
}

function shell(title: string, body: string): string {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;background:#F7F2E8;padding:28px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E9DDC7;border-radius:14px;overflow:hidden;">
      <div style="background:#20251D;padding:22px 26px;">
        <div style="color:#C6A15B;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Old Damascus</div>
        <div style="color:#ffffff;font-size:21px;margin-top:6px;">${escapeHtml(title)}</div>
      </div>
      <div style="padding:26px;color:#18200F;font-size:14px;line-height:1.6;">
        ${body}
      </div>
      <div style="padding:16px 26px;background:#F7F2E8;color:#68705F;font-size:12px;border-top:1px solid #E9DDC7;">
        ${escapeHtml(restaurant.address.full)}<br/>
        ${escapeHtml(restaurant.phone)}
      </div>
    </div>
  </div>`;
}

async function send(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[OrderEmail] RESEND_API_KEY not set — skipping "${subject}" to ${to}`
    );
    return false;
  }

  // Must be a domain verified in Resend; the shared testing sender only
  // delivers to the account owner.
  const from =
    process.env.RESEND_FROM_EMAIL ||
    `Old Damascus <onboarding@resend.dev>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      console.error(`[OrderEmail] Resend rejected "${subject}":`, await res.text());
      return false;
    }
    console.log(`[OrderEmail] Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error(`[OrderEmail] Failed to send "${subject}":`, err);
    return false;
  }
}

/** Customer receipt + restaurant alert. Never throws. */
export async function sendOrderEmails(
  order: OrderEmailPayload
): Promise<{ customer: boolean; restaurant: boolean }> {
  const result = { customer: false, restaurant: false };

  try {
    const rows = itemRows(order.items);

    // ---- Customer confirmation ----
    result.customer = await send(
      order.customerEmail,
      `Your Old Damascus order ${order.orderNumber}`,
      shell(
        "Thank you for your order",
        `
        <p>Hi ${escapeHtml(order.customerName.split(" ")[0] || "there")}, your order is confirmed and in the kitchen.</p>
        <p style="margin:18px 0;padding:12px 14px;background:#F7F2E8;border-radius:10px;">
          <strong>Order ${escapeHtml(order.orderNumber)}</strong><br/>
          <span style="color:#68705F;">Pickup at ${escapeHtml(restaurant.address.street)}, ${escapeHtml(restaurant.address.city)}</span>
        </p>
        <table style="width:100%;font-size:14px;">${rows}</table>
        ${totalsBlock(order)}
        ${order.notes ? `<p style="margin-top:16px;color:#68705F;"><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}
        <p style="margin-top:20px;color:#68705F;">Questions or changes? Call us at ${escapeHtml(restaurant.phone)} with your order number.</p>`
      )
    );

    // ---- Restaurant alert ----
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || restaurant.email;

    if (adminEmail) {
      result.restaurant = await send(
        adminEmail,
        `New pickup order ${order.orderNumber} — ${money(order.totalCents)}`,
        shell(
          `New order ${order.orderNumber}`,
          `
          <p style="margin:0 0 16px;"><strong>Pickup order received from the website.</strong></p>
          <table style="width:100%;font-size:14px;margin-bottom:16px;">
            <tr><td style="color:#68705F;padding:2px 0;">Customer</td><td style="text-align:right;">${escapeHtml(order.customerName)}</td></tr>
            <tr><td style="color:#68705F;padding:2px 0;">Phone</td><td style="text-align:right;">${escapeHtml(order.customerPhone)}</td></tr>
            <tr><td style="color:#68705F;padding:2px 0;">Email</td><td style="text-align:right;">${escapeHtml(order.customerEmail)}</td></tr>
          </table>
          <table style="width:100%;font-size:14px;">${rows}</table>
          ${totalsBlock(order)}
          ${order.notes ? `<p style="margin-top:16px;"><strong>Kitchen notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}`
        )
      );
    }
  } catch (err) {
    // A paid order must never fail because of email.
    console.error("[OrderEmail] Unexpected failure:", err);
  }

  return result;
}
