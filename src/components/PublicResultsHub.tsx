"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LivePill } from "@/components/LivePill";
import { BrandMark } from "@/components/ui/primitives";
import { NEW_WINDOW_MS, dayLabel, timeAgo, useNow } from "@/lib/live";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { placementLabel } from "@/lib/utils";

type HubItem = {
  id: string;
  name: string;
  code: string;
  publishedAt: string;
  placed: { chestNo: string; placement: number }[];
};

const placeTone: Record<number, string> = {
  1: "bg-brand-green text-white",
  2: "bg-brand-blue text-white",
  3: "bg-brand-red text-white",
};

function Chevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-green"
      aria-hidden
    >
      <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ChestFinder({ items }: { items: HubItem[] }) {
  const [chest, setChest] = useState("");
  const query = chest.trim().toLowerCase();
  const hits = useMemo(() => {
    if (!query) return [];
    return items.flatMap((item) =>
      item.placed
        .filter((p) => p.chestNo.toLowerCase() === query)
        .map((p) => ({ item, placement: p.placement })),
    ).sort((a, b) => a.placement - b.placement);
  }, [items, query]);

  return (
    <section className="card overflow-hidden">
      <div className="p-4 sm:p-5">
        <label htmlFor="chest-finder" className="font-display text-lg font-bold">
          Check by chest number
        </label>
        <p className="text-sm text-ink-muted">Shows every published item where that chest number placed.</p>
        <div className="relative mt-3">
          <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-muted" fill="none" aria-hidden>
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            id="chest-finder"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 104"
            className="tabular min-h-12 w-full rounded-[10px] border border-line bg-paper pl-11 pr-3.5 font-display text-lg font-bold focus:border-brand-green focus:bg-paper-raised focus:outline-none focus:ring-4 focus:ring-brand-green/15"
          />
        </div>

        <AnimatePresence mode="wait">
          {query ? (
            <motion.div
              key={hits.length ? "hits" : "none"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3"
              aria-live="polite"
            >
              {hits.length === 0 ? (
                <p className="rounded-[10px] bg-paper px-3 py-2.5 text-sm text-ink-muted">
                  Chest <span className="tabular font-bold text-ink">{chest.trim()}</span> has no placement in the published items.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {hits.map(({ item, placement }) => (
                    <li key={item.id}>
                      <Link
                        href={`/results/${item.id}?chest=${encodeURIComponent(chest.trim())}`}
                        className="group flex items-center gap-3 rounded-[10px] bg-paper px-3 py-2.5 text-ink no-underline transition hover:bg-rise"
                      >
                        <span
                          className={`tabular flex h-8 min-w-12 items-center justify-center rounded-full px-2 font-display text-sm font-extrabold ${
                            placeTone[placement] ?? "bg-ink/8 text-ink"
                          }`}
                        >
                          {placementLabel(placement)}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-semibold">{item.name}</span>
                        <Chevron />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ItemCard({ item, now }: { item: HubItem; now: Date | null }) {
  const fresh = now ? now.getTime() - new Date(item.publishedAt).getTime() < NEW_WINDOW_MS : false;
  return (
    <Link
      href={`/results/${item.id}`}
      className="card group flex h-full min-h-20 items-center gap-4 px-4 py-4 text-ink no-underline transition hover:border-brand-green/40 hover:text-ink"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rise font-display text-sm font-extrabold text-brand-green-dark">
        {item.code.slice(0, 3)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-display text-base font-bold">{item.name}</span>
          {fresh ? (
            <span className="shrink-0 rounded-full bg-blush px-2 py-0.5 text-xs font-semibold text-brand-red">
              New
            </span>
          ) : null}
        </span>
        <span className="text-xs text-ink-muted">
          <span className="tabular font-semibold tracking-[0.08em]">{item.code}</span>
          {now ? <> · {timeAgo(item.publishedAt, now)}</> : null}
        </span>
      </span>
      <Chevron />
    </Link>
  );
}

export function PublicResultsHub({ items }: { items: HubItem[] }) {
  const [q, setQ] = useState("");
  const now = useNow();
  const latest = items[0];

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? items.filter((i) => i.name.toLowerCase().includes(t) || i.code.toLowerCase().includes(t))
      : items;
  }, [items, q]);

  const groups = useMemo(() => {
    if (!now) return [{ label: "", list: shown }];
    const map = new Map<string, HubItem[]>();
    for (const item of shown) {
      const label = dayLabel(item.publishedAt, now);
      map.set(label, [...(map.get(label) ?? []), item]);
    }
    return [...map.entries()].map(([label, list]) => ({ label, list }));
  }, [shown, now]);

  return (
    <div className="min-h-dvh">
      <div className="brand-bar" />
      <header className="hero-field border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:gap-6 sm:py-10 sm:text-left">
          <BrandMark size="lg" />
          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <motion.h1 variants={fadeUp} className="font-display text-[clamp(1.75rem,4.5vw,2.5rem)] font-extrabold text-ink">
              Results
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-1 max-w-md text-ink-muted">
              Placements for each item, posted as they are announced.
              {items.length > 0 ? (
                <>
                  {" "}
                  <span className="tabular font-semibold text-ink">{items.length}</span>{" "}
                  {items.length === 1 ? "item" : "items"} so far.
                </>
              ) : null}
            </motion.p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        {items.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
            <div className="brand-bar w-16 rounded-full" />
            <h2 className="mt-3 font-display text-lg font-bold">No results yet</h2>
            <p className="max-w-sm text-ink-muted">This page refreshes itself when an item is published.</p>
            <LivePill />
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              {latest ? (
                <Link
                  href={`/results/${latest.id}`}
                  className="card group flex flex-col justify-between p-5 text-ink no-underline transition hover:border-brand-green/40 hover:text-ink sm:p-6"
                >
                  <span className="text-sm text-ink-muted">
                    Latest{now ? <> · {timeAgo(latest.publishedAt, now)}</> : null}
                  </span>
                  <span className="mt-2">
                    <span className="tabular block text-sm font-bold tracking-[0.12em] text-brand-blue">{latest.code}</span>
                    <span className="block font-display text-[clamp(1.5rem,4vw,2rem)] font-extrabold leading-tight">
                      {latest.name}
                    </span>
                  </span>
                  <span className="mt-5 flex items-center justify-between gap-3">
                    <span className="flex gap-1.5">
                      {latest.placed.slice(0, 3).map((p) => (
                        <span
                          key={p.placement + p.chestNo}
                          className={`tabular flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-extrabold ${
                            placeTone[p.placement] ?? "bg-ink/8 text-ink"
                          }`}
                          title={`${placementLabel(p.placement)} · chest ${p.chestNo}`}
                        >
                          {p.chestNo}
                        </span>
                      ))}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-green-dark">
                      View <Chevron />
                    </span>
                  </span>
                </Link>
              ) : null}
              <ChestFinder items={items} />
            </div>

            <div className="mb-4 mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-xl font-bold">All items</h2>
                <LivePill />
              </div>
              {items.length > 3 ? (
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="search"
                  placeholder="Search item or code"
                  className="min-h-11 w-full rounded-[10px] border border-line bg-paper-raised px-3.5 text-base focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/15 sm:w-64"
                />
              ) : null}
            </div>

            {shown.length === 0 ? (
              <p className="card px-6 py-10 text-center text-ink-muted">Nothing matches “{q}”.</p>
            ) : (
              <div className="flex flex-col gap-8">
                {groups.map((g) => (
                  <section key={g.label || "all"}>
                    {g.label ? (
                      <h3 className="mb-3 text-sm font-semibold text-ink-muted">{g.label}</h3>
                    ) : null}
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {g.list.map((item) => (
                        <li key={item.id}>
                          <ItemCard item={item} now={now} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <div className="mx-auto max-w-5xl px-4 pb-6 pt-2 text-center text-xs text-ink-muted">
        <Link href="/login" className="text-ink-muted no-underline hover:text-ink">
          Admin
        </Link>
      </div>
    </div>
  );
}
