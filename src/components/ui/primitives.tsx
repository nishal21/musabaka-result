import Link from "next/link";
import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "blue";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-brand-green text-white shadow-[0_1px_0_oklch(1_0_0/0.2)_inset,0_6px_16px_-8px_var(--brand-green)] hover:bg-brand-green-dark",
  blue: "bg-brand-blue text-white hover:bg-brand-blue-dark",
  secondary: "bg-paper-raised text-ink border border-line hover:border-ink/25 hover:bg-paper",
  danger: "bg-transparent text-brand-red border border-brand-red/25 hover:bg-blush",
  ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-ink/5",
};

export function buttonClass(variant: Variant = "primary", size: "md" | "sm" = "md") {
  const sizing = size === "sm" ? "min-h-9 px-3 text-sm" : "min-h-11 px-4 text-[0.95rem]";
  return `inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold no-underline transition duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 ${sizing} ${variantClass[variant]}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "md" | "sm" }) {
  return <button className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant, size)} hover:text-inherit ${className}`}>
      {children}
    </Link>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">{label}</span>
      {children}
      {hint && !error ? <span className="text-xs text-ink-muted">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-brand-red">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "min-h-12 w-full rounded-[10px] border border-line bg-paper-raised px-3.5 py-2 text-base text-ink transition placeholder:text-ink-muted/60 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/15 disabled:bg-paper disabled:text-ink-muted";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} min-h-20 resize-y ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export type ItemStatus = "draft" | "scoring" | "ready" | "published";

export function StatusChip({ status }: { status: ItemStatus }) {
  const map = {
    draft: { cls: "bg-ink/6 text-ink-muted", dot: "bg-ink/35", label: "Draft" },
    scoring: { cls: "bg-sky text-brand-blue-dark", dot: "bg-brand-blue", label: "Scoring" },
    ready: { cls: "bg-rise text-brand-green-dark", dot: "bg-brand-green", label: "Ready to publish" },
    published: { cls: "bg-brand-green text-white", dot: "bg-white", label: "Published" },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${map.cls}`}
    >
      <span className={`size-1.5 rounded-full ${map.dot}`} aria-hidden />
      {map.label}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <BrandMark size="sm" className="opacity-80" />
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <p className="max-w-sm text-ink-muted">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function PageTitle({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: ReactNode;
  title: string;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-sm text-ink-muted">{eyebrow}</div> : null}
        <h1 className="font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-extrabold leading-tight text-ink">
          {title}
        </h1>
        {sub ? <div className="mt-1 text-ink-muted">{sub}</div> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export type NavKey = "items" | "judges";

export function AppHeader({
  title,
  nav,
  active,
  right,
}: {
  title?: string;
  nav?: boolean;
  active?: NavKey;
  right?: ReactNode;
}) {
  const tabs: { key: NavKey; href: string; label: string }[] = [
    { key: "items", href: "/admin", label: "Items" },
    { key: "judges", href: "/admin/judges", label: "Judges" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-paper-raised/90 backdrop-blur-md">
      <div className="brand-bar" />
      <div
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 border-b border-line px-4 py-2.5"
        style={{ paddingTop: "max(0.625rem, var(--safe-top))" }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark size="sm" className="shrink-0" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-[0.8rem] font-extrabold tracking-[0.12em] text-ink">
              SKJMCC MUSABAQA
            </p>
            {title ? <p className="truncate text-xs text-ink-muted">{title}</p> : null}
          </div>
          {nav ? (
            <nav className="ml-4 hidden items-center gap-1 sm:flex">
              {tabs.map((t) => (
                <Link
                  key={t.key}
                  href={t.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold no-underline transition ${
                    active === t.key
                      ? "bg-rise text-brand-green-dark"
                      : "text-ink-muted hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        {right ? <div className="flex shrink-0 items-center gap-1.5">{right}</div> : null}
      </div>
      {nav ? (
        <nav className="flex gap-1 border-b border-line px-3 py-1.5 sm:hidden">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold no-underline ${
                active === t.key ? "bg-rise text-brand-green-dark" : "text-ink-muted"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

/**
 * transparent `/logo.png` for page surfaces; solid `/logo.jpg` where an opaque tile reads better
 */
export function BrandMark({
  size = "md",
  variant = "transparent",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "transparent" | "solid";
  className?: string;
}) {
  const px = { sm: 40, md: 80, lg: 128, xl: 220 }[size];
  const wh = {
    sm: "h-10 w-10",
    md: "h-20 w-20",
    lg: "h-28 w-28 sm:h-32 sm:w-32",
    xl: "h-40 w-40 sm:h-56 sm:w-56",
  }[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={variant === "solid" ? "/logo.jpg" : "/logo.png"}
      alt="SKJMCC Musabaqa"
      className={`${wh} object-contain ${className}`}
      width={px}
      height={px}
    />
  );
}
