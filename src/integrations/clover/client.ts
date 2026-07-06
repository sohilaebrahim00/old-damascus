// ============================================================
// Clover API Client
// Server-side only — never import in browser code.
// ============================================================

import { getCloverConfig } from "./config";
import { CloverApiError } from "./errors";

/**
 * Standard fetch helper for Clover REST V3 API
 */
export async function cloverFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cfg = getCloverConfig();

  if (!cfg.merchantId || !cfg.apiToken) {
    throw new CloverApiError(
      "Clover V3 API credentials are not configured",
      "CLOVER_NOT_CONFIGURED"
    );
  }

  // Ensure path starts with a slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${cfg.apiBase}/v3/merchants/${cfg.merchantId}${cleanPath}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${cfg.apiToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  // Remove Authorization header from logging context for safety
  const safeHeaders = { ...headers } as Record<string, string | undefined>;
  delete safeHeaders.Authorization;

  console.log(`[Clover V3 Request] ${options.method || "GET"} ${url}`, {
    headers: safeHeaders,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      let errMsg = `Clover API error ${status}`;
      try {
        const body = await response.text();
        errMsg = `Clover API error ${status}: ${body}`;
      } catch {}
      console.error(`[Clover V3 Error] ${errMsg}`);
      throw new CloverApiError(errMsg, "CLOVER_API_ERROR", status);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof CloverApiError) throw err;
    const msg = err instanceof Error ? err.message : "Network/Timeout error";
    console.error(`[Clover V3 Request Failure] ${msg}`);
    throw new CloverApiError(msg, "CLOVER_NETWORK_ERROR");
  }
}

/**
 * Fetch helper for Clover Ecommerce (SCL) API (orders/pay, charges, tokens)
 */
export async function cloverEcomFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cfg = getCloverConfig();

  if (!cfg.ecomPrivateKey) {
    throw new CloverApiError(
      "Clover Ecommerce private key is not configured",
      "CLOVER_NOT_CONFIGURED"
    );
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${cfg.ecomBase}${cleanPath}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${cfg.ecomPrivateKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  const safeHeaders = { ...headers } as Record<string, string | undefined>;
  delete safeHeaders.Authorization;

  console.log(`[Clover SCL Request] ${options.method || "GET"} ${url}`, {
    headers: safeHeaders,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for payment processing

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      let errMsg = `Clover SCL error ${status}`;
      try {
        const body = await response.text();
        errMsg = `Clover SCL error ${status}: ${body}`;
      } catch {}
      console.error(`[Clover SCL Error] ${errMsg}`);
      throw new CloverApiError(errMsg, "CLOVER_SCL_ERROR", status);
    }

    return (await response.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof CloverApiError) throw err;
    const msg = err instanceof Error ? err.message : "Network/Timeout error";
    console.error(`[Clover SCL Request Failure] ${msg}`);
    throw new CloverApiError(msg, "CLOVER_NETWORK_ERROR");
  }
}

export async function cloverPost<T>(path: string, body: unknown): Promise<T> {
  return cloverFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function cloverDelete<T>(path: string): Promise<T> {
  return cloverFetch<T>(path, {
    method: "DELETE",
  });
}
