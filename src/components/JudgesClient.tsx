"use client";

import { useState, useTransition } from "react";
import { AppHeader, Button, EmptyState, Field, Input, PageTitle } from "@/components/ui/primitives";
import { createJudgeAction, resetJudgePasswordAction, adminLogoutAction } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";

type Judge = { id: string; name: string };

function LogoutButton() {
  return (
    <form action={adminLogoutAction}>
      <Button variant="ghost" size="sm" type="submit">
        Logout
      </Button>
    </form>
  );
}

export function JudgesClient({ judges }: { judges: Judge[] }) {
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);

  return (
    <div className="min-h-dvh">
      <AppHeader nav active="judges" right={<LogoutButton />} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <PageTitle
          eyebrow="Roster"
          title="Judges"
          sub="Add a judge once and reuse them on any item."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section>
            {judges.length === 0 ? (
              <EmptyState title="No judges yet" body="Add the first judge with a name and password." />
            ) : (
              <ul className="card divide-y divide-line overflow-hidden">
                {judges.map((j) => (
                  <li key={j.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rise font-display font-extrabold text-brand-green-dark">
                        {j.name.slice(0, 1).toUpperCase()}
                      </span>
                      <p className="min-w-0 flex-1 truncate font-semibold">{j.name}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setResetting(resetting === j.id ? null : j.id)}
                      >
                        {resetting === j.id ? "Cancel" : "Reset password"}
                      </Button>
                    </div>
                    {resetting === j.id ? (
                      <form
                        className="mt-3 flex flex-col gap-2 sm:flex-row"
                        action={(fd) => {
                          fd.set("id", j.id);
                          start(async () => {
                            const res = await resetJudgePasswordAction(fd);
                            if (!res.ok) push(res.error, "err");
                            else {
                              push(`Password updated for ${j.name}`);
                              setResetting(null);
                            }
                          });
                        }}
                      >
                        <Input
                          name="password"
                          type="password"
                          placeholder="New password"
                          required
                          minLength={4}
                          autoFocus
                          className="sm:flex-1"
                        />
                        <Button type="submit" variant="blue" disabled={pending}>
                          Save
                        </Button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card h-fit p-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-extrabold">Add judge</h2>
            <p className="mt-0.5 text-sm text-ink-muted">Share the password with the judge privately.</p>
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
              <Field label="Name">
                <Input name="name" required minLength={2} />
              </Field>
              <Field label="Password" error={error ?? undefined}>
                <Input name="password" type="password" required minLength={4} />
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
