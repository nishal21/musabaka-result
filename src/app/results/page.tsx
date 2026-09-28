import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PublicResultsHub } from "@/components/PublicResultsHub";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Official results",
  description: `Published ${SITE.name} placements. Marks stay private — only ranks are shown.`,
  alternates: { canonical: "/results" },
  openGraph: {
    title: `${SITE.name} — Official results`,
    description: "View published competition placements. Marks are not public.",
    url: "/results",
    images: [{ url: SITE.ogImage.path, width: SITE.ogImage.width, height: SITE.ogImage.height, alt: SITE.ogImage.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Official results`,
    images: [SITE.ogImage.path],
  },
};

export default async function ResultsHubPage() {
  const items = await prisma.item.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { id: true, name: true, code: true },
  });
  return <PublicResultsHub items={items} />;
}
