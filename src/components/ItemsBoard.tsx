"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteItemAction } from "@/lib/actions";
import { motion } from "framer-motion";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { buttonClass, ItemStatus, StatusChip } from "@/components/ui/primitives";
import { fadeUp, staggerContainer } from "@/lib/motion";

export type BoardItem = {
  id: string;
  name: string;
  code: string;
  participants: number;
  judge1: string;
  judge2: string;
  j1Done: boolean;
  j2Done: boolean;
  status: ItemStatus;
  judgeUrl: string;
};

const filters: { key: "all" | ItemStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scoring", label: "Scoring" },
  { key: "ready", label: "Ready" },
  { key: "published", label: "Published" },
];

function JudgePill({ name, done }: { name: string; done: boolean }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        done ? "border-brand-green/30 bg-rise text-brand-green-dark" : "border-line text-ink-muted"
      }`}
    >
      {done ? (
        <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="size-2 shrink-0 rounded-full border-2 border-current opacity-60" aria-hidden />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}

export function ItemsBoard({ items }: { items: BoardItem[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | ItemStatus>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [, start] = useTransition();

  const remove = (item: BoardItem) => {
    const warning =
      item.status === "published"
        ? `Delete "${item.name}" (${item.code})?\n\nIt is published and will disappear from the public results. All participants, marks and placements will be lost. This cannot be undone.`
        : `Delete "${item.name}" (${item.code})?\n\nAll participants, marks and placements will be lost. This cannot be undone.`;
    if (!confirm(warning)) return;
    setDeleting(item.id);
    start(async () => {
      try {
        await deleteItemAction(item.id);
      } finally {
        setDeleting(null);
      }
    });
  };

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(
      (i) =>
        (filter === "all" || i.status === filter) &&
        (!term || i.name.toLowerCase().includes(term) || i.code.toLowerCase().includes(term)),
    );
  }, [items, q, filter]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          >
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or code"
            className="min-h-11 w-full rounded-[10px] border border-line bg-paper-raised pl-10 pr-3 text-base focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/15"
          />
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                filter === f.key ? "bg-ink text-paper" : "bg-paper-raised text-ink-muted ring-1 ring-line hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="card px-5 py-10 text-center text-ink-muted">No items match.</p>
      ) : (
        <motion.ul
          className="grid gap-3 md:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {shown.map((item) => (
            <motion.li key={item.id} variants={fadeUp} className="card flex flex-col overflow-hidden">
              <Link
                href={`/admin/items/${item.id}/results`}
                className="group flex flex-1 flex-col gap-3 p-4 text-ink no-underline hover:text-ink sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="tabular text-xs font-bold tracking-[0.1em] text-brand-blue">{item.code}</p>
                    <h2 className="mt-0.5 font-display text-lg font-bold leading-snug group-hover:text-brand-green-dark">
                      {item.name}
                    </h2>
                  </div>
                  <StatusChip status={item.status} />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <JudgePill name={item.judge1} done={item.j1Done} />
                  <JudgePill name={item.judge2} done={item.j2Done} />
                  <span className="ml-auto text-sm text-ink-muted">
                    <span className="tabular font-semibold text-ink">{item.participants}</span> participants
                  </span>
                </div>
              </Link>
              <div className="flex flex-wrap gap-1.5 border-t border-line bg-paper/60 px-3 py-2.5 sm:px-4">
                <Link href={`/admin/items/${item.id}/participants`} className={buttonClass("secondary", "sm")}>
                  Participants
                </Link>
                <Link href={`/admin/items/${item.id}/results`} className={buttonClass("secondary", "sm")}>
                  Results
                </Link>
                <CopyLinkButton url={item.judgeUrl} size="sm" />
                <a href={`/api/items/${item.id}/pdf`} download className={`${buttonClass("ghost", "sm")} ml-auto`}>
                  PDF
                </a>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  disabled={deleting === item.id}
                  aria-label={`Delete ${item.name}`}
                  className={`${buttonClass("ghost", "sm")} text-brand-red hover:bg-brand-red/10 hover:text-brand-red disabled:opacity-50`}
                >
                  {deleting === item.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
