import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Naskh_Arabic, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SKJMCC Musabaqa",
    template: "%s · SKJMCC Musabaqa",
  },
  description: "SKJMCC Musabaqa judging and results",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#008d36",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sourceSans.variable} ${notoNaskh.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-body text-ink">
        <ToastProvider>
          <div className="flex min-h-dvh flex-1 flex-col">{children}</div>
        </ToastProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
