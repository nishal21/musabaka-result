"use client";

import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/Toast";

export function CopyLinkButton({ url, size = "md" }: { url: string; size?: "md" | "sm" }) {
  const { push } = useToast();
  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      onClick={async () => {
        url = window.location.origin + new URL(url).pathname;
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        try {
          if (isTouch && navigator.share) {
            await navigator.share({ title: "Musabaqa judge link", url });
            return;
          }
          await navigator.clipboard.writeText(url);
          push("Judge link copied");
        } catch (e) {
          if ((e as Error)?.name === "AbortError") return;
          push("Could not copy link", "err");
        }
      }}
    >
      <svg viewBox="0 0 20 20" className="size-4 text-brand-blue" fill="none" aria-hidden>
        <path
          d="M8 12l4-4M7 9.5l-1.8 1.8a2.8 2.8 0 004 4L11 13.5M13 10.5l1.8-1.8a2.8 2.8 0 00-4-4L9 6.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
      Judge link
    </Button>
  );
}
