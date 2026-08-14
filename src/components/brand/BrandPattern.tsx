/* ------------------------------------------------------------------ */
/* Damascene geometry — an eight-point girih star, the motif carved     */
/* into Old Damascus doorways and tilework.                             */
/*                                                                      */
/* Rendered as inline SVG so it costs no request, inherits currentColor */
/* and can sit at whatever opacity a section needs. Used sparingly:     */
/* section grounds, dividers, and quiet corners — never as wallpaper.   */
/* ------------------------------------------------------------------ */

import { cn } from "@/lib/utils";

/**
 * A tiling star-and-cross field. Absolutely positioned by default so it
 * can be dropped behind a section's content.
 */
export function BrandPattern({
  className,
  scale = 72,
  opacity = 0.05,
}: {
  className?: string;
  scale?: number;
  opacity?: number;
}) {
  // Derived from the props rather than a counter: a counter would advance
  // differently on server and client and break hydration. Two patterns that
  // collide here are byte-identical, so sharing one <defs> entry is correct.
  const id = `girih-${scale}-${Math.round(opacity * 1000)}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={id}
          width={scale}
          height={scale}
          patternUnits="userSpaceOnUse"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          >
            {/* eight-point star: two squares, one rotated 45° */}
            <rect
              x={scale * 0.22}
              y={scale * 0.22}
              width={scale * 0.56}
              height={scale * 0.56}
            />
            <rect
              x={scale * 0.22}
              y={scale * 0.22}
              width={scale * 0.56}
              height={scale * 0.56}
              transform={`rotate(45 ${scale / 2} ${scale / 2})`}
            />
            {/* corner quarter-stars knit the tiles together */}
            <rect
              x={scale * -0.09}
              y={scale * -0.09}
              width={scale * 0.18}
              height={scale * 0.18}
              transform={`rotate(45 0 0)`}
            />
            <rect
              x={scale * 0.91}
              y={scale * -0.09}
              width={scale * 0.18}
              height={scale * 0.18}
              transform={`rotate(45 ${scale} 0)`}
            />
            <rect
              x={scale * -0.09}
              y={scale * 0.91}
              width={scale * 0.18}
              height={scale * 0.18}
              transform={`rotate(45 0 ${scale})`}
            />
            <rect
              x={scale * 0.91}
              y={scale * 0.91}
              width={scale * 0.18}
              height={scale * 0.18}
              transform={`rotate(45 ${scale} ${scale})`}
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * A single star glyph — for dividers, empty states and quiet accents.
 */
export function BrandStar({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  const c = size / 2;
  const s = size * 0.62;
  const o = (size - s) / 2;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    >
      <rect x={o} y={o} width={s} height={s} />
      <rect x={o} y={o} width={s} height={s} transform={`rotate(45 ${c} ${c})`} />
    </svg>
  );
}

/**
 * Editorial section divider: hairline — star — hairline.
 */
export function BrandDivider({
  className,
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "olive" | "white";
}) {
  const color =
    tone === "gold"
      ? "text-brand-gold"
      : tone === "white"
        ? "text-white/40"
        : "text-olive/30";

  return (
    <div
      className={cn("flex items-center gap-5", color, className)}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-current opacity-40" />
      <BrandStar size={18} className="opacity-70" />
      <span className="h-px flex-1 bg-current opacity-40" />
    </div>
  );
}
