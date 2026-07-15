// ============================================================
// Admin Authorization Helper
// Centralizes the admin role check across all admin routes.
// ============================================================

interface UserLike {
  email?: string;
  app_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
}

/**
 * Returns true if the user is authorized for admin actions.
 * Checks:
 * 1. Email matches ADMIN_NOTIFICATION_EMAIL env var
 * 2. Supabase app_metadata.role === 'admin'
 *
 * NOTE: In production, remove the ADMIN_NOTIFICATION_EMAIL fallback
 * once proper RBAC is configured in Supabase.
 */
export function isAdminUser(user: UserLike | null | undefined): boolean {
  if (!user) return false;

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (adminEmail && user.email === adminEmail) return true;
  if (user.app_metadata?.role === "admin") return true;

  return false;
}

export function isEmployeeUser(user: UserLike | null | undefined, profileRole?: string | null): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  if (user.app_metadata?.role === "employee" || profileRole === "employee") return true;
  return false;
}

export function isAdminOrEmployee(user: UserLike | null | undefined, profileRole?: string | null): boolean {
  return isAdminUser(user) || isEmployeeUser(user, profileRole);
}
