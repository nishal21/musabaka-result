"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Re-fetches server data on an interval while the tab is visible. */
export function useAutoRefresh(ms = 30_000) {
  const router = useRouter();
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    setLastSync(new Date());
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setLastSync(new Date());
    };
    const id = window.setInterval(tick, ms);
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, ms]);

  return lastSync;
}

/** Null on the server and first paint, so server and client markup match. */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }) : null;

export function timeAgo(iso: string, now: Date) {
  const diff = (new Date(iso).getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diff);
  if (!rtf) return "";
  if (abs < 45) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86_400), "day");
}

export function dayLabel(iso: string, now: Date) {
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(now) - start(d)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
}

export const NEW_WINDOW_MS = 3 * 60 * 60 * 1000;
