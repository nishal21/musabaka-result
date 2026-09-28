import Link from "next/link";
import { ReactNode } from "react";
import { BrandMark } from "@/components/ui/primitives";

export function AuthShell({
  kicker,
  title,
  sub,
  children,
}: {
  kicker: string;
  title: string;
  sub?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh md:grid-cols-[1.05fr_1fr]">
      <aside className="hero-field relative hidden flex-col justify-between overflow-hidden border-r border-line p-10 md:flex">
        <div className="brand-bar absolute inset-x-0 top-0" />
        <Link href="/results" className="text-sm font-semibold text-ink-muted no-underline hover:text-ink">
          ← Public results
        </Link>
        <div className="flex flex-col items-center text-center">
          <BrandMark size="xl" />
          <p className="mt-8 max-w-xs text-lg text-ink-muted">
            Scoring, placements and published results for every item.
          </p>
        </div>
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>Judging &amp; results</span>
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-brand-green" />
            <span className="size-2 rounded-full bg-brand-blue" />
            <span className="size-2 rounded-full bg-brand-red" />
          </span>
        </div>
      </aside>

      <main className="flex flex-col">
        <div className="brand-bar md:hidden" />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-10">
          <div className="mb-8 flex flex-col items-center text-center md:items-start md:text-left">
            <BrandMark size="md" className="md:hidden" />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-green-dark md:mt-0">
              {kicker}
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">{title}</h1>
            {sub ? <div className="mt-1.5 text-ink-muted">{sub}</div> : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
