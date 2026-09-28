export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const SITE = {
  name: "SKJMCC Musabaqa",
  shortName: "Musabaqa",
  org: "Samastha Kerala Jam'iyyathul Muallimeen Central Council (SKJMCC)",
  tagline: "Islamic arts & literature fest — judging and official results",
  description:
    "Official SKJMCC Musabaqa results and judging portal. View published placements for competition items. Built for madrassa arts and literature fest scoring in Kerala, India.",
  locale: "en_IN",
  language: "en",
  region: "IN-KL",
  placename: "Kerala, India",
  country: "India",
  keywords: [
    "SKJMCC",
    "Musabaqa",
    "مسابقة",
    "Samastha Kerala",
    "madrassa competition",
    "Islamic arts fest",
    "literature fest",
    "competition results",
    "Kerala",
    "judging portal",
  ],
  author: {
    name: "Nishal K",
    url: "https://github.com/nishal21",
  },
  ogImage: {
    path: "/og.jpg",
    width: 1672,
    height: 941,
    alt: "SKJMCC Musabaqa — مسابقة logo with Islamic arts fest theme",
  },
} as const;
