import { BrandPattern } from "@/components/brand/BrandPattern";

/* ------------------------------------------------------------------ */
/* Guest identity treated as a maître d' would treat a name card:      */
/* engraved initials on the house colours. No avatar illustration,     */
/* no placeholder person icon.                                          */
/* ------------------------------------------------------------------ */

interface IdentitySource {
  email?: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    name?: string;
    [key: string]: unknown;
  } | null;
}

/** Derive up to two initials from profile metadata, falling back to email. */
export function initialsFor(user: IdentitySource | null | undefined): string {
  const meta = user?.user_metadata ?? {};
  const first = (meta.first_name || "").trim();
  const last = (meta.last_name || "").trim();

  if (first || last) {
    return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "OD";
  }

  const full = ((meta.full_name || meta.name || "") as string).trim();
  if (full) {
    const parts = full.split(/\s+/);
    return (
      ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "OD"
    );
  }

  const email = (user?.email || "").trim();
  if (email) return email.slice(0, 2).toUpperCase();

  return "OD";
}

/** Display name, degrading gracefully to the email local-part. */
export function displayNameFor(user: IdentitySource | null | undefined): string {
  const meta = user?.user_metadata ?? {};
  const full = [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim();
  if (full) return full;
  const alt = ((meta.full_name || meta.name || "") as string).trim();
  if (alt) return alt;
  const email = user?.email || "";
  return email ? email.split("@")[0] : "Guest";
}

export function Monogram({
  user,
  size = "md",
}: {
  user: IdentitySource | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "w-20 h-20 text-xl"
      : size === "sm"
        ? "w-9 h-9 text-[11px]"
        : "w-14 h-14 text-sm";

  return (
    <span
      className={`${dims} relative shrink-0 inline-flex items-center justify-center rounded-full
                  border border-brand-gold/40 bg-brand-dark text-brand-gold
                  font-heading font-semibold tracking-[0.08em] select-none overflow-hidden`}
    >
      <BrandPattern className="text-brand-gold" scale={26} opacity={0.18} />
      <span className="relative z-10">{initialsFor(user)}</span>
    </span>
  );
}

/** Full identity header for the account area. */
export function AccountIdentity({
  user,
}: {
  user: IdentitySource | null | undefined;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-dark px-6 py-8 text-center">
      <BrandPattern className="text-brand-gold" scale={64} opacity={0.07} />

      <div className="relative z-10 flex flex-col items-center">
        <Monogram user={user} size="lg" />

        <p className="font-heading text-xl font-semibold text-white tracking-tight mt-5">
          {displayNameFor(user)}
        </p>
        {user?.email && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mt-2 break-all">
            {user.email}
          </p>
        )}

        <span
          className="block w-10 h-px bg-brand-gold/60 mt-5"
          aria-hidden="true"
        />
        <p className="text-[10px] uppercase tracking-[0.28em] text-brand-gold/80 mt-4">
          Old Damascus
        </p>
      </div>
    </div>
  );
}
