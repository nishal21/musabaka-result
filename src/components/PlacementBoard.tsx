"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/ui/primitives";
import { placementLabel } from "@/lib/utils";
import { easeOutQuart, rankReveal } from "@/lib/motion";

type Row = { placement: number; chestNo: string; codeLetter: string };

// 1st takes the logo's green, 2nd its blue, 3rd its red
const medal: Record<number, { ring: string; chip: string; text: string; bar: string; h: string }> = {
  1: { ring: "ring-brand-green/35", chip: "bg-brand-green text-white", text: "text-brand-green-dark", bar: "bg-brand-green", h: "sm:min-h-56" },
  2: { ring: "ring-brand-blue/30", chip: "bg-brand-blue text-white", text: "text-brand-blue-dark", bar: "bg-brand-blue", h: "sm:min-h-48" },
  3: { ring: "ring-brand-red/25", chip: "bg-brand-red text-white", text: "text-brand-red", bar: "bg-brand-red", h: "sm:min-h-44" },
};

function PodiumCard({ row, index }: { row: Row; index: number }) {
  const m = medal[row.placement];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.15 + index * 0.12, duration: 0.5, ease: easeOutQuart } }}
      className={`card relative flex flex-col items-center justify-end overflow-hidden px-4 pb-5 pt-6 text-center ring-2 ${m.ring} ${m.h}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1.5 ${m.bar}`} aria-hidden />
      <span className={`rounded-full px-3 py-1 font-display text-sm font-extrabold ${m.chip}`}>
        {placementLabel(row.placement)}
      </span>
      <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-muted">Chest no</p>
      <p className={`tabular font-display text-4xl font-extrabold leading-none ${m.text}`}>{row.chestNo}</p>
      <p className="mt-3 text-sm text-ink-muted">
        Code <span className="font-bold text-ink">{row.codeLetter}</span>
      </p>
    </motion.div>
  );
}

export function PlacementBoard({ item, rows }: { item: { name: string; code: string }; rows: Row[] }) {
  const podium = rows.filter((r) => r.placement <= 3);
  const rest = rows.filter((r) => r.placement > 3);
  // DOM stays 1-2-3 for mobile; sm:order-* lays out 2nd, 1st, 3rd
  const podiumOrder = [1, 2, 3]
    .flatMap((p) => podium.filter((r) => r.placement === p))
    .map((r) => ({ r, orderCls: r.placement === 1 ? "sm:order-2" : r.placement === 2 ? "sm:order-1" : "sm:order-3" }));

  return (
    <div className="min-h-dvh">
      <div className="brand-bar" />
      <header className="hero-field border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link href="/results" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg pr-2 text-sm font-semibold text-ink-muted no-underline hover:text-ink">
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
            All results
          </Link>
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-8 pt-0 text-center sm:pb-10">
          <BrandMark size="md" className="mb-3" />
          <p className="tabular rounded-full bg-sky px-3 py-0.5 text-xs font-bold tracking-[0.16em] text-brand-blue-dark">
            {item.code}
          </p>
          <h1 className="mt-1 font-display text-[clamp(1.7rem,5vw,2.6rem)] font-extrabold leading-tight">{item.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">Final placements</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        {rows.length === 0 ? (
          <p className="card px-6 py-12 text-center text-ink-muted">Placements will appear here once set.</p>
        ) : (
          <>
            {podium.length > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-center">
                {podiumOrder.map(({ r, orderCls }, i) => (
                  <div key={`${r.placement}-${r.chestNo}`} className={`sm:w-1/3 sm:max-w-[15rem] ${orderCls}`}>
                    <PodiumCard row={r} index={i} />
                  </div>
                ))}
              </div>
            ) : null}

            {rest.length > 0 ? (
              <ol className="mt-6 flex flex-col gap-2">
                {rest.map((r, i) => (
                  <motion.li
                    key={`${r.placement}-${r.chestNo}`}
                    custom={i + 3}
                    variants={rankReveal}
                    initial="hidden"
                    animate="show"
                    className="card flex items-center gap-4 px-4 py-3"
                  >
                    <span className="tabular w-12 shrink-0 font-display text-lg font-extrabold text-ink-muted">
                      {placementLabel(r.placement)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink-muted">Chest </span>
                      <span className="tabular font-bold">{r.chestNo}</span>
                    </span>
                    <span className="text-sm text-ink-muted">
                      Code <span className="font-bold text-ink">{r.codeLetter}</span>
                    </span>
                  </motion.li>
                ))}
              </ol>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
