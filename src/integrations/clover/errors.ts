// ============================================================
// Clover API Errors
// ============================================================

export class CloverApiError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = "CloverApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function isCloverConfigError(err: unknown): boolean {
  return err instanceof CloverApiError && err.code === "CLOVER_NOT_CONFIGURED";
}

/** Clover is rate-limiting us (HTTP 429). */
export function isCloverRateLimit(err: unknown): boolean {
  return (
    err instanceof CloverApiError &&
    (err.statusCode === 429 || err.code === "CLOVER_RATE_LIMITED")
  );
}

/**
 * A message safe to show a guest. Clover's raw errors carry status codes and
 * response JSON, which must never reach the storefront.
 */
export function toCustomerMessage(err: unknown): string {
  if (isCloverRateLimit(err)) {
    return "Online ordering is temporarily busy. Please try again in a moment.";
  }
  if (isCloverConfigError(err)) {
    return "Online ordering is temporarily unavailable. Please call the restaurant to place your order.";
  }
  return "We couldn't process that just now. Please try again, or call the restaurant to place your order.";
}
