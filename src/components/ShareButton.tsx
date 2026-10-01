"use client";

import { useToast } from "@/components/ui/Toast";

type Props = {
  title: string;
  text: string;
  /** Path or absolute URL; defaults to the current page. */
  url?: string;
  label?: string;
  variant?: "ghost" | "solid";
  whatsapp?: boolean;
};

function absolute(url?: string) {
  if (!url) return window.location.href;
  return new URL(url, window.location.origin).toString();
}

export function ShareButton({ title, text, url, label = "Share", variant = "ghost", whatsapp = false }: Props) {
  const { push } = useToast();

  async function share() {
    const link = absolute(url);
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, text, url: link });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${link}`);
      push("Link copied");
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") push("Could not share", "err");
    }
  }

  function openWhatsApp() {
    const msg = encodeURIComponent(`${text}\n${absolute(url)}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  const base =
    variant === "solid"
      ? "bg-ink text-paper hover:bg-ink/85"
      : "text-ink-muted hover:bg-ink/5 hover:text-ink";

  return (
    <span className="inline-flex items-center gap-1">
      {whatsapp ? (
        <button
          type="button"
          onClick={openWhatsApp}
          aria-label="Share on WhatsApp"
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
            variant === "solid" ? "bg-[#25D366] text-white hover:bg-[#1ebe5b]" : "text-ink-muted hover:bg-ink/5 hover:text-[#128C7E]"
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.1.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.4-.3z" />
          </svg>
          {variant === "solid" ? "WhatsApp" : null}
        </button>
      ) : null}
      <button
        type="button"
        onClick={share}
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${base}`}
      >
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden>
          <path
            d="M10 3v9M6.5 6.5L10 3l3.5 3.5M5 10.5v4.75c0 .7.55 1.25 1.25 1.25h7.5c.7 0 1.25-.55 1.25-1.25V10.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </button>
    </span>
  );
}
