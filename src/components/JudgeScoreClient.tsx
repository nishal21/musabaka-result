"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { AppHeader, Button, Input, Textarea } from "@/components/ui/primitives";
import { ConfirmSheet } from "@/components/ui/ConfirmSheet";
import { useToast } from "@/components/ui/Toast";
import { judgeLogoutAction, saveJudgeScoresAction, submitJudgeScoresAction } from "@/lib/actions";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Row = {
  id: string;
  slNo: number;
  chestNo: string;
  codeLetter: string;
  mark: string;
  grade: string;
  remark: string;
};

function markError(v: string) {
  if (v.trim() === "") return null;
  const n = Number(v);
  if (Number.isNaN(n) || n < 0 || n > 100) return "0–100 only";
  return null;
}

export function JudgeScoreClient({
  token,
  itemName,
  itemCode,
  judgeName,
  locked,
  initial,
}: {
  token: string;
  itemName: string;
  itemCode: string;
  judgeName: string;
  locked: boolean;
  initial: Row[];
}) {
  const [rows, setRows] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(locked);
  const { push } = useToast();

  const scored = rows.filter((r) => r.mark.trim() !== "" && !markError(r.mark)).length;
  const missing = rows.length - scored;
  const hasErrors = rows.some((r) => markError(r.mark));
  const dirtyIds = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r, i) => {
      const o = saved[i];
      if (!o || r.mark !== o.mark || r.grade !== o.grade || r.remark !== o.remark) s.add(r.id);
    });
    return s;
  }, [rows, saved]);
  const pct = rows.length ? Math.round((scored / rows.length) * 100) : 0;

  const payload = () =>
    rows.map((r) => ({ participantId: r.id, mark: r.mark, grade: r.grade, remark: r.remark }));

  function update(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function saveAll() {
    if (hasErrors) {
      push("Fix marks outside 0–100 first", "err");
      return;
    }
    start(async () => {
      const res = await saveJudgeScoresAction(token, payload());
      if (!res.ok) push(res.error, "err");
      else {
        setSaved(rows);
        push("Saved");
      }
    });
  }

  return (
    <div className="min-h-dvh pb-32">
      <AppHeader
        title={`Judge · ${judgeName}`}
        right={
          <form action={() => judgeLogoutAction(token)}>
            <Button variant="ghost" size="sm" type="submit">
              Logout
            </Button>
          </form>
        }
      />

      <div className="border-b border-line bg-paper-raised">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="tabular text-[0.7rem] font-bold tracking-[0.12em] text-brand-blue">{itemCode}</p>
              <h1 className="truncate font-display text-lg font-extrabold leading-tight">{itemName}</h1>
            </div>
            <p className="tabular shrink-0 text-sm text-ink-muted">
              <span className="font-bold text-ink">{scored}</span>/{rows.length}
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/8">
            <motion.div
              className="h-full rounded-full bg-brand-green"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-5">
        {done ? (
          <div className="card mb-5 flex items-start gap-3 border-brand-green/30 bg-rise p-4">
            <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 text-brand-green" aria-hidden>
              <circle cx="10" cy="10" r="8.5" fill="currentColor" />
              <path d="M6 10.5l2.5 2.5L14 7.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            <div>
              <p className="font-bold text-brand-green-dark">Submitted — thank you</p>
              <p className="text-sm text-ink-muted">Your scores are locked. Ask the admin if something needs fixing.</p>
            </div>
          </div>
        ) : (
          <p className="mb-4 text-sm text-ink-muted">Mark out of 100 · Grade in capitals · Remark optional</p>
        )}

        <motion.ul className="flex flex-col gap-3" variants={staggerContainer} initial="hidden" animate="show">
          {rows.map((r) => {
            const err = markError(r.mark);
            const dirty = dirtyIds.has(r.id);
            const filled = r.mark.trim() !== "" && !err;
            return (
              <motion.li
                key={r.id}
                variants={fadeUp}
                className={`card overflow-hidden transition ${err ? "ring-2 ring-brand-red/40" : ""}`}
              >
                <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
                  <span
                    className={`tabular flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${
                      filled ? "bg-brand-green text-white" : "bg-ink/6 text-ink-muted"
                    }`}
                  >
                    {r.slNo}
                  </span>
                  <p className="min-w-0 flex-1 text-sm">
                    <span className="text-ink-muted">Chest </span>
                    <span className="tabular font-bold">{r.chestNo}</span>
                    <span className="mx-1.5 text-ink/20">|</span>
                    <span className="text-ink-muted">Code </span>
                    <span className="font-bold">{r.codeLetter}</span>
                  </p>
                  {!done ? (
                    <span className={`text-xs font-semibold ${dirty ? "text-brand-blue" : "text-ink-muted/70"}`}>
                      {dirty ? "Unsaved" : filled ? "Saved" : ""}
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-[1fr_1fr] gap-3 p-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-muted">Mark</span>
                    <Input
                      inputMode="decimal"
                      className="tabular text-center font-display text-xl font-extrabold"
                      disabled={done}
                      value={r.mark}
                      onChange={(e) => update(r.id, { mark: e.target.value })}
                      placeholder="—"
                      aria-invalid={Boolean(err)}
                    />
                    {err ? <span className="text-xs font-medium text-brand-red">{err}</span> : null}
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-muted">Grade</span>
                    <Input
                      className="text-center font-display text-xl font-extrabold uppercase"
                      disabled={done}
                      value={r.grade}
                      maxLength={4}
                      onChange={(e) => update(r.id, { grade: e.target.value.toUpperCase() })}
                      autoCapitalize="characters"
                      placeholder="—"
                    />
                  </label>
                  <label className="col-span-2 flex flex-col gap-1">
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-muted">Remark</span>
                    <Textarea
                      rows={2}
                      disabled={done}
                      value={r.remark}
                      onChange={(e) => update(r.id, { remark: e.target.value })}
                      maxLength={500}
                      placeholder="Optional"
                    />
                  </label>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </main>

      {!done ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper-raised/95 backdrop-blur-md">
          <div
            className="mx-auto flex max-w-2xl gap-2 px-4 pt-3"
            style={{ paddingBottom: "max(0.75rem, var(--safe-bottom))" }}
          >
            <Button type="button" variant="secondary" className="flex-1" disabled={pending} onClick={saveAll}>
              {dirtyIds.size > 0 ? `Save (${dirtyIds.size})` : "Save"}
            </Button>
            <Button
              type="button"
              className="flex-[1.4]"
              disabled={pending || hasErrors}
              onClick={() => setConfirm(true)}
            >
              Submit results
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmSheet
        open={confirm}
        title="Are these results OK?"
        body={
          <div className="space-y-3">
            <p>
              Submitting scores for <strong className="text-ink">{itemName}</strong>.
            </p>
            <div className="flex items-center justify-between rounded-[10px] bg-paper px-3 py-2.5">
              <span>Participants marked</span>
              <span className={`tabular font-bold ${missing ? "text-brand-red" : "text-brand-green-dark"}`}>
                {scored} / {rows.length}
              </span>
            </div>
            <p>
              {missing > 0
                ? "Every participant needs a mark before you can submit."
                : "After OK your scores lock and go to the admin."}
            </p>
          </div>
        }
        confirmLabel="OK, submit"
        busy={pending}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          if (missing > 0) {
            setConfirm(false);
            push(`${missing} participant(s) still need a mark`, "err");
            return;
          }
          start(async () => {
            const save = await saveJudgeScoresAction(token, payload());
            if (!save.ok) {
              push(save.error, "err");
              setConfirm(false);
              return;
            }
            const res = await submitJudgeScoresAction(token);
            setConfirm(false);
            if (!res.ok) push(res.error, "err");
            else {
              setSaved(rows);
              setDone(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          });
        }}
      />
    </div>
  );
}
