"use client";

import { ExternalLink } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { integrations } from "@/config/integrations";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * External link to the Slice delivery storefront.
 * Client component so the click can be reported through the existing
 * analytics helper from server-rendered pages (e.g. /menu/[slug]).
 */
export function SliceOrderLink({
  source,
  label = "Slice",
  className,
}: {
  source: string;
  label?: string;
  className?: string;
}) {
  if (!integrations.sliceEnabled) return null;

  return (
    <a
      href={restaurant.sliceUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("slice_click", { source })}
      className={cn("btn-outline btn-sm", className)}
    >
      {label} <ExternalLink className="w-3 h-3" />
    </a>
  );
}
