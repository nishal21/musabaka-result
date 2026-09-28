"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BrandMark, LinkButton } from "@/components/ui/primitives";

const lines = [
  "Our judges searched every chest number. Nothing.",
  "This page skipped its performance.",
  "Even the podium can't find it.",
  "Grade: LOST. Remark: try another link.",
];

const dots = [
  { c: "bg-brand-green", d: 0 },
  { c: "bg-brand-blue", d: 0.15 },
  { c: "bg-brand-red", d: 0.3 },
];

export function NotFoundFun() {
  const [i, setI] = useState(0);
  const [spins, setSpins] = useState(0);

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="brand-bar" />
      <main className="hero-field flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-12 text-center">
        <motion.button
          type="button"
          aria-label="Spin the logo"
          onClick={() => setSpins((s) => s + 1)}
          animate={{ rotate: spins * 360, y: [0, -8, 0] }}
          transition={{ rotate: { type: "spring", stiffness: 120, damping: 12 }, y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
          className="cursor-pointer"
        >
          <BrandMark size="lg" />
        </motion.button>

        <motion.div
          initial={{ rotate: -14, y: 40, opacity: 0 }}
          animate={{ rotate: -4, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.15 }}
          whileHover={{ rotate: 2, scale: 1.03 }}
          className="card relative mt-8 w-full max-w-[18rem] overflow-hidden text-left"
        >
          <div className="brand-bar" />
          <div className="flex items-center justify-between border-b border-dashed border-line px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
            <span>Judge scorecard</span>
            <span className="tabular">Chest ???</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-muted">Mark</p>
              <p className="tabular font-display text-4xl font-extrabold text-brand-green">
                4<span className="text-ink/25">/</span>04
              </p>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-muted">Grade</p>
              <p className="font-display text-4xl font-extrabold text-brand-red">LOST</p>
            </div>
          </div>
          <motion.span
            initial={{ scale: 2.4, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: -16 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 15 }}
            className="absolute bottom-3 right-3 rounded-md border-2 border-brand-blue px-2 py-0.5 font-display text-xs font-extrabold uppercase tracking-[0.12em] text-brand-blue"
          >
            Not found
          </motion.span>
        </motion.div>

        <h1 className="mt-8 font-display text-3xl font-extrabold">Oops, wrong stage!</h1>
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 min-h-12 max-w-sm text-ink-muted"
        >
          {lines[i]}
        </motion.p>

        <div className="mt-3 flex gap-2" aria-hidden>
          {dots.map((d) => (
            <motion.span
              key={d.c}
              className={`size-2.5 rounded-full ${d.c}`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: d.d, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <LinkButton href="/results">Take me to results</LinkButton>
          <button
            type="button"
            onClick={() => setI((n) => (n + 1) % lines.length)}
            className="min-h-11 rounded-[10px] px-4 font-semibold text-ink-muted transition hover:bg-ink/5 hover:text-ink"
          >
            Ask the judges again
          </button>
        </div>
      </main>
    </div>
  );
}
