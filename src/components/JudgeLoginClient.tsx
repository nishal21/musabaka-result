"use client";

import { useState, useTransition } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button, Field, Input } from "@/components/ui/primitives";
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
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <AuthShell
      kicker={`Judge · ${itemCode}`}
      title={itemName}
      sub="Choose your name and enter your password."
    >
      <form
        className="flex flex-col gap-5"
        action={(fd) => {
          setError(null);
          start(async () => {
            const res = await judgeLoginAction(token, fd);
            if (res && !res.ok) setError(res.error);
          });
        }}
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
            I am
          </legend>
          {judges.map((j) => {
            const on = selected === j.id;
            return (
              <label
                key={j.id}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-[12px] border-2 px-4 transition ${
                  on ? "border-brand-green bg-rise" : "border-line bg-paper-raised hover:border-ink/20"
                }`}
              >
                <input
                  type="radio"
                  name="judgeId"
                  value={j.id}
                  required
                  className="sr-only"
                  onChange={() => setSelected(j.id)}
                />
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold ${
                    on ? "bg-brand-green text-white" : "bg-ink/6 text-ink-muted"
                  }`}
                >
                  {j.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="flex-1 font-semibold">{j.name}</span>
                {on ? (
                  <svg viewBox="0 0 16 16" className="size-5 text-brand-green" aria-hidden>
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                ) : null}
              </label>
            );
          })}
        </fieldset>
        <Field label="Password" error={error ?? undefined}>
          <Input name="password" type="password" required autoComplete="current-password" />
        </Field>
        <Button type="submit" className="w-full" disabled={pending || !selected}>
          {pending ? "Signing in…" : "Start scoring"}
        </Button>
      </form>
    </AuthShell>
  );
}
