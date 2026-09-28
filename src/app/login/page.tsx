"use client";

import { useState, useTransition } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button, Field, Input } from "@/components/ui/primitives";
import { adminLoginAction } from "@/lib/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <AuthShell kicker="Admin" title="Sign in" sub="Manage items, judges and results.">
      <form
        className="flex flex-col gap-5"
        action={(fd) => {
          setError(null);
          start(async () => {
            const res = await adminLoginAction(fd);
            if (res && !res.ok) setError(res.error);
          });
        }}
      >
        <Field label="Password" error={error ?? undefined}>
          <Input name="password" type="password" autoComplete="current-password" required autoFocus />
        </Field>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
