"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AppHeader, Button, Input, LinkButton, PageTitle, StatusChip } from "@/components/ui/primitives";
import {
  adminLogoutAction,
  publishItemAction,
  savePlacementsAction,
  unlockJudgeSubmissionAction,
  unpublishItemAction,
} from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";
import { ConfirmSheet } from "@/components/ui/ConfirmSheet";

type Row = {
  id: string;
  slNo: number;
  chestNo: string;
  codeLetter: string;
  placement: number | null;
  j1Mark: number | null;
  j2Mark: number | null;
  j1Grade: string | null;
  j2Grade: string | null;
  j1Remark: string | null;
  j2Remark: string | null;
};

const placeTone: Record<string, string> = {
  "1": "border-brand-green bg-rise text-brand-green-dark",
  "2": "border-brand-blue bg-sky text-brand-blue-dark",
  "3": "border-brand-red bg-blush text-brand-red",
};

function PlaceInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Input
      className={`tabular w-16 text-center font-display font-extrabold ${placeTone[value.trim()] ?? ""}`}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="—"
      aria-label="Placement"
    />
  );
}

export function ResultsClient({
  item,
  rows,
  judge1,
  judge2,
  j1Submitted,
  j2Submitted,
  audits,
}: {
  item: { id: string; name: string; code: string; publishedAt: string | null };
  rows: Row[];
  judge1: { id: string; name: string };
  judge2: { id: string; name: string };
  j1Submitted: boolean;
  j2Submitted: boolean;
  audits: { id: string; action: string; createdAt: string; detail: string }[];
}) {
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [placements, setPlacements] = useState(
    Object.fromEntries(rows.map((r) => [r.id, r.placement?.toString() ?? ""])),
  );
  const [confirmPublish, setConfirmPublish] = useState(false);

  const status = item.publishedAt ? "published" : j1Submitted && j2Submitted ? "ready" : "scoring";
  const sorted = useMemo(() => [...rows].sort((a, b) => a.slNo - b.slNo), [rows]);
  const setPlace = (id: string, v: string) => setPlacements((p) => ({ ...p, [id]: v }));

  function savePlacements() {
    start(async () => {
      const payload = Object.entries(placements).map(([participantId, v]) => ({
        participantId,
        placement: v.trim() === "" ? null : Number(v),
      }));
      for (const p of payload) {
        if (p.placement !== null && (!Number.isInteger(p.placement) || p.placement < 1)) {
          push("Placements must be positive whole numbers", "err");
          return;
        }
      }
      const res = await savePlacementsAction(item.id, payload);
      if (!res.ok) push(res.error, "err");
      else push("Placements saved");
    });
  }

  const judges = [
    { j: judge1, done: j1Submitted, label: "Judge 1" },
    { j: judge2, done: j2Submitted, label: "Judge 2" },
  ];

  return (
    <div className="min-h-dvh pb-28">
      <AppHeader
        nav
        active="items"
        right={
          <form action={adminLogoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Logout
            </Button>
          </form>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <PageTitle
          eyebrow={
            <span>
              <Link href="/admin" className="font-semibold text-brand-blue no-underline">
                ← Items
              </Link>
              <span className="mx-2 text-ink/20">/</span>
              <span className="tabular font-bold tracking-[0.1em] text-brand-blue">{item.code}</span>
            </span>
          }
          title={item.name}
          sub={<StatusChip status={status} />}
          action={
            <div className="flex flex-wrap gap-2">
              <LinkButton href={`/admin/items/${item.id}/participants`} variant="ghost">
                Participants
              </LinkButton>
              <a href={`/api/items/${item.id}/pdf`} download className="contents">
                <Button type="button" variant="secondary">
                  Download PDF
                </Button>
              </a>
              {item.publishedAt ? (
                <Button
                  type="button"
                  variant="danger"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await unpublishItemAction(item.id);
                      push("Unpublished");
                    })
                  }
                >
                  Unpublish
                </Button>
              ) : (
                <Button type="button" onClick={() => setConfirmPublish(true)}>
                  Publish result
                </Button>
              )}
            </div>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {judges.map(({ j, done, label }) => (
            <div key={j.id} className="card flex items-center gap-3 p-4">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full font-display font-extrabold ${
                  done ? "bg-brand-green text-white" : "bg-ink/6 text-ink-muted"
                }`}
              >
                {done ? "✓" : j.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
                <p className="truncate font-semibold">{j.name}</p>
              </div>
              {done ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await unlockJudgeSubmissionAction(item.id, j.id);
                      push(`${j.name} unlocked`);
                    })
                  }
                >
                  Unlock
                </Button>
              ) : (
                <span className="text-sm text-ink-muted">Scoring…</span>
              )}
            </div>
          ))}
        </div>

        <div className="card mt-6 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
            <thead className="bg-paper text-[0.68rem] uppercase tracking-[0.08em] text-ink-muted">
              <tr>
                {[
                  "SL NO",
                  "Chest NO",
                  "Code letter",
                  "Judge 1 mark",
                  "Judge 2 mark",
                  "Total mark",
                  "Judge 1 grade",
                  "Judge 2 grade",
                  "Remark",
                  "Place",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sorted.map((r) => {
                const total = r.j1Mark != null && r.j2Mark != null ? r.j1Mark + r.j2Mark : null;
                const remark =
                  [r.j1Remark && `J1: ${r.j1Remark}`, r.j2Remark && `J2: ${r.j2Remark}`]
                    .filter(Boolean)
                    .join(" | ") || "—";
                return (
                  <tr key={r.id} className={total == null ? "bg-blush/50" : "hover:bg-paper/60"}>
                    <td className="tabular px-3 py-2.5 text-ink-muted">{r.slNo}</td>
                    <td className="tabular px-3 py-2.5 font-bold">{r.chestNo}</td>
                    <td className="px-3 py-2.5 font-semibold">{r.codeLetter}</td>
                    <td className="tabular px-3 py-2.5">{r.j1Mark ?? "—"}</td>
                    <td className="tabular px-3 py-2.5">{r.j2Mark ?? "—"}</td>
                    <td className="tabular px-3 py-2.5 font-display text-base font-extrabold">{total ?? "—"}</td>
                    <td className="px-3 py-2.5 font-semibold">{r.j1Grade ?? "—"}</td>
                    <td className="px-3 py-2.5 font-semibold">{r.j2Grade ?? "—"}</td>
                    <td className="max-w-[14rem] truncate px-3 py-2.5 text-ink-muted" title={remark}>
                      {remark}
                    </td>
                    <td className="px-3 py-1.5">
                      <PlaceInput value={placements[r.id] ?? ""} onChange={(v) => setPlace(r.id, v)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="mt-6 flex flex-col gap-3 lg:hidden">
          {sorted.map((r) => {
            const total = r.j1Mark != null && r.j2Mark != null ? r.j1Mark + r.j2Mark : null;
            return (
              <li key={r.id} className={`card p-4 ${total == null ? "ring-1 ring-brand-red/25" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-ink-muted">SL {r.slNo}</p>
                    <p className="font-semibold">
                      Chest <span className="tabular font-extrabold">{r.chestNo}</span> · {r.codeLetter}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted">Total</p>
                    <p className="tabular font-display text-2xl font-extrabold leading-none">{total ?? "—"}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 rounded-[10px] bg-paper p-3 text-sm">
                  <div>
                    <dt className="text-xs text-ink-muted">{judge1.name}</dt>
                    <dd className="tabular font-semibold">
                      {r.j1Mark ?? "—"} <span className="text-ink-muted">· {r.j1Grade ?? "—"}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">{judge2.name}</dt>
                    <dd className="tabular font-semibold">
                      {r.j2Mark ?? "—"} <span className="text-ink-muted">· {r.j2Grade ?? "—"}</span>
                    </dd>
                  </div>
                  {r.j1Remark || r.j2Remark ? (
                    <div className="col-span-2 text-ink-muted">
                      {[r.j1Remark && `J1: ${r.j1Remark}`, r.j2Remark && `J2: ${r.j2Remark}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  ) : null}
                </dl>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Place</span>
                  <PlaceInput value={placements[r.id] ?? ""} onChange={(v) => setPlace(r.id, v)} />
                </div>
              </li>
            );
          })}
        </ul>

        <section className="mt-10">
          <h2 className="font-display text-lg font-extrabold">Audit log</h2>
          {audits.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">No changes recorded yet.</p>
          ) : (
            <ol className="mt-4 border-l-2 border-line pl-5">
              {audits.map((a) => (
                <li key={a.id} className="relative pb-4 text-sm">
                  <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-paper bg-brand-blue" />
                  <p className="font-semibold">{a.action}</p>
                  <p className="text-xs text-ink-muted">{new Date(a.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper-raised/95 backdrop-blur-md">
        <div
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-3"
          style={{ paddingBottom: "max(0.75rem, var(--safe-bottom))" }}
        >
          <p className="hidden text-sm text-ink-muted sm:block">1 = first place. Leave blank for no placement.</p>
          <Button type="button" className="flex-1 sm:flex-none" disabled={pending} onClick={savePlacements}>
            {pending ? "Saving…" : "Save placements"}
          </Button>
        </div>
      </div>

      <ConfirmSheet
        open={confirmPublish}
        title="Publish result?"
        body="Students will see placements only, never marks, on the public results page. Save placements first."
        confirmLabel="Publish"
        busy={pending}
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() =>
          start(async () => {
            const res = await publishItemAction(item.id);
            setConfirmPublish(false);
            if (!res.ok) push(res.error, "err");
            else push("Published");
          })
        }
      />
    </div>
  );
}
