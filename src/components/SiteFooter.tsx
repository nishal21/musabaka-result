import Link from "next/link";

const GITHUB = "https://github.com/nishal21";

export function SiteFooter({ showAdmin = false }: { showAdmin?: boolean }) {
  return (
    <footer
      className="mt-auto border-t border-line/70 bg-paper-raised/50 px-4 py-3.5 text-center text-xs text-ink-muted"
      style={{ paddingBottom: "max(0.875rem, var(--safe-bottom))" }}
    >
      <p>
        Built by{" "}
        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-ink underline-offset-2 hover:text-brand-green hover:underline"
        >
          Nishal K
        </a>
        {showAdmin ? (
          <>
            {" · "}
            <Link href="/login" className="text-ink-muted no-underline hover:text-ink">
              Admin
            </Link>
          </>
        ) : null}
      </p>
    </footer>
  );
}
