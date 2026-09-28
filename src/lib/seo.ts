import type { Metadata } from "next";
import { SITE, siteUrl } from "@/lib/site";

export function buildMetadata(overrides: Metadata = {}): Metadata {
  const url = siteUrl();
  const og = SITE.ogImage;

  return {
    metadataBase: new URL(url),
    title: {
      default: `${SITE.name} — Official Results & Judging`,
      template: `%s · ${SITE.name}`,
    },
    description: SITE.description,
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.author.name, url: SITE.author.url }],
    creator: SITE.author.name,
    publisher: SITE.org,
    category: "education",
    applicationName: SITE.name,
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false, email: false, address: false },
    alternates: {
      canonical: "/",
      languages: {
        "en-IN": "/",
        "ml-IN": "/",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      alternateLocale: ["ml_IN", "ar"],
      url,
      siteName: SITE.name,
      title: `${SITE.name} — Official Results & Judging`,
      description: SITE.description,
      images: [
        {
          url: og.path,
          width: og.width,
          height: og.height,
          alt: og.alt,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE.name} — Official Results`,
      description: SITE.description,
      images: [og.path],
    },
    other: {
      "geo.region": SITE.region,
      "geo.placename": SITE.placename,
      "geo.position": "10.8505;76.2711",
      ICBM: "10.8505, 76.2711",
      "og:locale:alternate": "ml_IN",
    },
    ...overrides,
  };
}
