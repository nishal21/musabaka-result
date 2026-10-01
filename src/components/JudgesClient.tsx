"use client";

import { useState, useTransition } from "react";
import { AppHeader, Button, EmptyState, Field, Input, PageTitle } from "@/components/ui/primitives";
import { createJudgeAction, adminLogoutAction } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";

type Judge = { id: string; name: string };

export function JudgesClient({ judges }: { judges: Judge[] }) {
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-dvh">
      <AppHeader
        nav
        active="judges"
        right={
          <form action={adminLogoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Logout
            </Button>
          </form>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <PageTitle eyebrow="Roster" title="Judges" sub="Add a judge once and reuse them on any item." />
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section>
            {judges.length === 0 ? (
              <EmptyState title="No judges yet" body="Add the first judge by name." />
            ) : (
              <ul className="card divide-y divide-line overflow-hidden">
                {judges.map((j) => (
                  <li key={j.id} className="flex items-center gap-3 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rise font-display font-extrabold text-brand-green-dark">
                      {j.name.slice(0, 1).toUpperCase()}
                    </span>
                    <p className="min-w-0 flex-1 truncate font-semibold">{j.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card h-fit p-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-extrabold">Add judge</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Judges open the item&apos;s private link and tap their name. Share each link only with its two judges.
            </p>
            <form
              id="add-judge-form"
              className="mt-4 flex flex-col gap-4"
              action={(fd) => {
                setError(null);
                start(async () => {
                  const res = await createJudgeAction(fd);
                  if (!res.ok) setError(res.error);
                  else {
                    push("Judge added");
                    (document.getElementById("add-judge-form") as HTMLFormElement | null)?.reset();
                  }
                });
              }}
            >
              <Field label="Name" error={error ?? undefined}>
                <Input name="name" required minLength={2} />
              </Field>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Add judge"}
              </Button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
