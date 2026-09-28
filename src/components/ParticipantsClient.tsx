"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AppHeader,
  Button,
  EmptyState,
  Field,
  Input,
  LinkButton,
  PageTitle,
} from "@/components/ui/primitives";
import { addParticipantAction, adminLogoutAction, deleteParticipantAction } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";
import { CopyLinkButton } from "@/components/CopyLinkButton";

type Participant = {
  id: string;
  slNo: number;
  chestNo: string;
  codeLetter: string;
};

export function ParticipantsClient({
  item,
  participants,
  judgeUrl,
}: {
  item: { id: string; name: string; code: string };
  participants: Participant[];
  judgeUrl: string;
}) {
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-dvh pb-16">
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
      <main className="mx-auto max-w-3xl px-4 py-8">
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
          sub={`${participants.length} participant${participants.length === 1 ? "" : "s"}`}
          action={
            <div className="flex gap-2">
              <CopyLinkButton url={judgeUrl} />
              <LinkButton href={`/admin/items/${item.id}/results`} variant="secondary">
                Results →
              </LinkButton>
            </div>
          }
        />

        <form
          id="add-part"
          className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-[6rem_1fr_1fr_auto] sm:items-end"
          action={(fd) => {
            setError(null);
            start(async () => {
              const res = await addParticipantAction(item.id, fd);
              if (!res.ok) setError(res.error);
              else {
                push("Participant added");
                const form = document.getElementById("add-part") as HTMLFormElement | null;
                form?.reset();
                (form?.elements.namedItem("chestNo") as HTMLInputElement | null)?.focus();
              }
            });
          }}
        >
          <Field label="SL NO">
            <Input name="slNo" inputMode="numeric" placeholder="Auto" className="tabular" />
          </Field>
          <Field label="Chest NO">
            <Input name="chestNo" required className="tabular" />
          </Field>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Code letter" error={error ?? undefined}>
              <Input name="codeLetter" required className="uppercase" />
            </Field>
          </div>
          <Button type="submit" className="col-span-2 sm:col-span-1" disabled={pending}>
            Add
          </Button>
        </form>

        <div className="mt-6">
          {participants.length === 0 ? (
            <EmptyState title="No participants yet" body="Add chest numbers and code letters above." />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-paper text-[0.7rem] uppercase tracking-[0.1em] text-ink-muted">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">SL</th>
                    <th className="px-4 py-2.5 font-bold">Chest</th>
                    <th className="px-4 py-2.5 font-bold">Code</th>
                    <th className="px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {participants.map((p) => (
                    <tr key={p.id} className="transition hover:bg-paper/60">
                      <td className="tabular px-4 py-3 text-ink-muted">{p.slNo}</td>
                      <td className="tabular px-4 py-3 font-bold">{p.chestNo}</td>
                      <td className="px-4 py-3 font-semibold">{p.codeLetter}</td>
                      <td className="px-2 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove chest ${p.chestNo}`}
                          className="hover:text-brand-red"
                          disabled={pending}
                          onClick={() => {
                            if (!confirm(`Remove chest ${p.chestNo}?`)) return;
                            start(async () => {
                              await deleteParticipantAction(item.id, p.id);
                              push("Removed");
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
