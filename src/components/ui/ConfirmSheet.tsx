"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/primitives";
import { easeOutQuart } from "@/lib/motion";

export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="sheet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { duration: 0.35, ease: easeOutQuart } }}
            exit={{ y: 24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-title" className="font-display text-xl font-bold text-ink">
              {title}
            </h2>
            <div className="mt-3 text-sm text-ink-muted">{body}</div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
                {cancelLabel}
              </Button>
              <Button type="button" onClick={onConfirm} disabled={busy}>
                {busy ? "Working…" : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
