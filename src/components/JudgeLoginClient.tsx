"use client";

import { useState, useTransition } from "react";
import { AuthShell } from "@/components/AuthShell";
import { judgeLoginAction } from "@/lib/actions";

export function JudgeLoginClient({
  token,
  itemName,
  itemCode,
  judges,
}: {
  token: string;
  itemName: string;
  itemCode: string;
  judges: { id: string; name: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function enter(judgeId: string) {
    setError(null);
    setPicked(judgeId);
    const fd = new FormData();
    fd.set("judgeId", judgeId);
    start(async () => {
      const res = await judgeLoginAction(token, fd);
      if (res && !res.ok) {
        setError(res.error);
        setPicked(null);
      }
    });
  }

  return (
    <AuthShell kicker={`Judge · ${itemCode}`} title={itemName} sub="Tap your name to start scoring.">
      <div className="flex flex-col gap-2">
        {judges.map((j) => {
          const busy = pending && picked === j.id;
          return (
            <button
              key={j.id}
              type="button"
              disabled={pending}
              onClick={() => enter(j.id)}
              className={`flex min-h-16 items-center gap-3 rounded-[12px] border-2 px-4 text-left transition active:scale-[0.99] disabled:opacity-60 ${
                busy ? "border-brand-green bg-rise" : "border-line bg-paper-raised hover:border-brand-green/50"
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full font-display font-extrabold ${
                  busy ? "bg-brand-green text-white" : "bg-ink/6 text-ink-muted"
                }`}
              >
                {j.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="flex-1 font-semibold">{j.name}</span>
              <span className="text-sm font-semibold text-brand-green-dark">{busy ? "Opening…" : "Start →"}</span>
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-brand-red">{error}</p> : null}
      <p className="mt-6 text-xs text-ink-muted">Only open this link if the admin sent it to you.</p>
    </AuthShell>
  );
}
