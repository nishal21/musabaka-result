"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AppHeader, Button, Field, Input, PageTitle, Select } from "@/components/ui/primitives";
import { adminLogoutAction, createItemAction, createJudgeAction } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";

type Judge = { id: string; name: string };

export function NewItemClient({ judges }: { judges: Judge[] }) {
  const [error, setError] = useState<string | null>(null);
  const [j1, setJ1] = useState("");
  const [pending, start] = useTransition();
  const { push } = useToast();

  return (
    <div className="min-h-dvh">
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
      <main className="mx-auto max-w-xl px-4 py-8">
        <PageTitle
          eyebrow={
            <Link href="/admin" className="font-semibold text-brand-blue no-underline">
              ← Items
            </Link>
          }
          title="New item"
          sub="Name it, give it a code and pick two judges."
        />

        <form
          className="card flex flex-col gap-5 p-5 sm:p-6"
          action={(fd) => {
            setError(null);
            start(async () => {
              const res = await createItemAction(fd);
              if (res && !res.ok) setError(res.error);
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
            <Field label="Item name">
              <Input name="name" required minLength={2} placeholder="e.g. Quran Recitation" />
            </Field>
            <Field label="Code">
              <Input name="code" required className="tabular uppercase" placeholder="QR01" />
            </Field>
          </div>
          <div className="h-px bg-line" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judge 1">
              <Select name="judge1Id" required value={j1} onChange={(e) => setJ1(e.target.value)}>
                <option value="">Select…</option>
                {judges.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Judge 2" error={error ?? undefined}>
              <Select name="judge2Id" required defaultValue="">
                <option value="">Select…</option>
                {judges
                  .filter((j) => j.id !== j1)
                  .map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
              </Select>
            </Field>
          </div>
          {judges.length < 2 ? (
            <p className="rounded-[10px] bg-blush px-3 py-2 text-sm text-brand-red">
              Add at least two judges first. Use quick-add below.
            </p>
          ) : null}
          <Button type="submit" disabled={pending || judges.length < 2}>
            {pending ? "Creating…" : "Create item"}
          </Button>
        </form>

        <details className="card group mt-5 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
            Quick-add judge
            <span className="text-ink-muted transition group-open:rotate-45">+</span>
          </summary>
          <form
            className="mt-4 flex flex-col gap-3"
            action={(fd) => {
              start(async () => {
                const res = await createJudgeAction(fd);
                if (!res.ok) push(res.error, "err");
                else {
                  push("Judge added");
                  window.location.reload();
                }
              });
            }}
          >
            <Input name="name" placeholder="Name" required minLength={2} />
            <Input name="password" type="password" placeholder="Password" required minLength={4} />
            <Button type="submit" variant="secondary" disabled={pending}>
              Add to roster
            </Button>
          </form>
        </details>
      </main>
    </div>
  );
}
