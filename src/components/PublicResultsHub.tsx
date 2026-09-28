"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/ui/primitives";
import { easeOutQuart, fadeUp, staggerContainer } from "@/lib/motion";

export function PublicResultsHub({
  items,
}: {
  items: { id: string; name: string; code: string }[];
}) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? items.filter((i) => i.name.toLowerCase().includes(t) || i.code.toLowerCase().includes(t))
      : items;
  }, [items, q]);

  return (
    <div className="min-h-dvh">
      <div className="brand-bar" />
      <header className="hero-field border-b border-line">
        <div className="mx-auto grid max-w-5xl items-center gap-6 px-4 pb-10 pt-8 sm:pb-14 sm:pt-12 md:grid-cols-[1fr_auto]">
          <motion.div
            className="order-2 text-center md:order-1 md:text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-paper-raised/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-green-dark ring-1 ring-brand-green/20"
            >
              <span className="size-1.5 rounded-full bg-brand-green" aria-hidden />
              Official results
            </motion.p>
            <motion.p
              variants={fadeUp}
              lang="ar"
              dir="rtl"
              className="mt-4 font-arabic text-[clamp(2.4rem,7vw,3.6rem)] font-bold leading-none text-ink"
            >
              مسابقة
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-2 font-display text-[clamp(1.5rem,4.2vw,2.4rem)] font-extrabold tracking-[0.04em] text-ink"
            >
              SKJMCC MUSABAQA
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-md text-ink-muted md:mx-0">
              Pick an item to see who placed. Results appear here as soon as they are announced.
            </motion.p>
          </motion.div>
          <motion.div
            className="order-1 flex justify-center md:order-2"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, ease: easeOutQuart } }}
          >
            <BrandMark size="xl" />
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold">Announced items</h2>
            <p className="text-sm text-ink-muted">
              <span className="tabular font-semibold text-ink">{items.length}</span>{" "}
              {items.length === 1 ? "item" : "items"} published
            </p>
          </div>
          {items.length > 6 ? (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search item or code"
              className="min-h-11 w-full rounded-[10px] border border-line bg-paper-raised px-3.5 text-base focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/15 sm:w-64"
            />
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
            <div className="brand-bar w-16 rounded-full" />
            <h3 className="mt-3 font-display text-lg font-bold">No results announced yet</h3>
            <p className="max-w-sm text-ink-muted">
              Results appear here once the admin publishes an item. Check back soon.
            </p>
          </div>
        ) : shown.length === 0 ? (
          <p className="card px-6 py-10 text-center text-ink-muted">Nothing matches “{q}”.</p>
        ) : (
          <motion.ul
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {shown.map((item) => (
              <motion.li key={item.id} variants={fadeUp}>
                <Link
                  href={`/results/${item.id}`}
                  className="card group flex h-full min-h-20 items-center gap-4 px-4 py-4 text-ink no-underline transition hover:-translate-y-0.5 hover:border-brand-green/40 hover:text-ink active:translate-y-0"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rise font-display text-sm font-extrabold text-brand-green-dark">
                    {item.code.slice(0, 3)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-base font-bold">{item.name}</span>
                    <span className="tabular text-xs font-semibold tracking-[0.08em] text-ink-muted">
                      {item.code}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    className="size-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-green"
                    aria-hidden
                  >
                    <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  </svg>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-6 pt-2 text-center text-xs text-ink-muted">
        <Link href="/login" className="text-ink-muted no-underline hover:text-ink">
          Admin
        </Link>
      </footer>
    </div>
  );
}
