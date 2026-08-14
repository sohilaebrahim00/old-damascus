// ============================================================
// Clover API Client
// Server-side only — never import in browser code.
// ============================================================

import { getCloverConfig } from "./config";
import { CloverApiError } from "./errors";

/* ------------------------------------------------------------------ */
/* Rate-limit resilience                                               */
/*                                                                     */
/* Clover returns HTTP 429 under burst load. Rather than surfacing that */
/* to the storefront, transient responses are retried with exponential  */
/* backoff, honouring Retry-After when Clover supplies it.              */
/* ------------------------------------------------------------------ */

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 400;

/** 429 plus the transient 5xx family are worth retrying; 4xx are not. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

/** Honour Retry-After (seconds, or an HTTP date) when present. */
function retryAfterMs(res: Response): number | null {
  const header = res.headers.get("retry-after");
  if (!header) return null;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

  const at = Date.parse(header);
  return Number.isNaN(at) ? null : Math.max(0, at - Date.now());
}

/** Exponential backoff with jitter, capped so a request can't hang forever. */
function backoffMs(attempt: number): number {
  const exponential = BASE_BACKOFF_MS * 2 ** attempt;
  const jitter = Math.random() * BASE_BACKOFF_MS;
  return Math.min(exponential + jitter, 4000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  for (let attempt = 0; ; attempt++) {
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

        if (isRetryableStatus(status) && attempt < MAX_RETRIES) {
          const wait = retryAfterMs(response) ?? backoffMs(attempt);
          console.warn(
            `[Clover V3 Retry] ${status} on ${cleanPath} — attempt ${attempt + 1}/${MAX_RETRIES}, waiting ${Math.round(wait)}ms`
          );
          await sleep(wait);
          continue;
        }

        let errMsg = `Clover API error ${status}`;
        try {
          const body = await response.text();
          errMsg = `Clover API error ${status}: ${body}`;
        } catch {}
        console.error(`[Clover V3 Error] ${errMsg}`);
        throw new CloverApiError(
          errMsg,
          status === 429 ? "CLOVER_RATE_LIMITED" : "CLOVER_API_ERROR",
          status
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof CloverApiError) throw err;

      // Network blips and timeouts are worth one more try too.
      if (attempt < MAX_RETRIES) {
        const wait = backoffMs(attempt);
        console.warn(
          `[Clover V3 Retry] network error on ${cleanPath} — attempt ${attempt + 1}/${MAX_RETRIES}, waiting ${Math.round(wait)}ms`
        );
        await sleep(wait);
        continue;
      }

      const msg = err instanceof Error ? err.message : "Network/Timeout error";
      console.error(`[Clover V3 Request Failure] ${msg}`);
      throw new CloverApiError(msg, "CLOVER_NETWORK_ERROR");
    }
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

  // Money moves through this fetcher. A POST that times out may already have
  // been captured, so only idempotent reads are ever retried — a blind retry
  // on /pay risks charging the guest twice.
  const method = (options.method ?? "GET").toUpperCase();
  const isIdempotent = method === "GET" || method === "HEAD";
  const maxAttempts = isIdempotent ? MAX_RETRIES : 0;

  for (let attempt = 0; ; attempt++) {
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

        if (isRetryableStatus(status) && attempt < maxAttempts) {
          const wait = retryAfterMs(response) ?? backoffMs(attempt);
          console.warn(
            `[Clover SCL Retry] ${status} on ${cleanPath} — attempt ${attempt + 1}/${maxAttempts}, waiting ${Math.round(wait)}ms`
          );
          await sleep(wait);
          continue;
        }

        let errMsg = `Clover SCL error ${status}`;
        try {
          const body = await response.text();
          errMsg = `Clover SCL error ${status}: ${body}`;
        } catch {}
        console.error(`[Clover SCL Error] ${errMsg}`);
        throw new CloverApiError(
          errMsg,
          status === 429 ? "CLOVER_RATE_LIMITED" : "CLOVER_SCL_ERROR",
          status
        );
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
