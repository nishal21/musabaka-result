"use client";

import { useAutoRefresh } from "@/lib/live";

export function LivePill() {
  const lastSync = useAutoRefresh();
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-muted">
      <span className="size-1.5 rounded-full bg-brand-green" aria-hidden />
      {lastSync
        ? `Updated ${lastSync.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`
        : "Updates automatically"}
    </span>
  );
}
