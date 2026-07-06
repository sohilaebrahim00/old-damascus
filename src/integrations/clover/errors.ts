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
