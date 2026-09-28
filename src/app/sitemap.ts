import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const published = await prisma.item.findMany({
    where: { publishedAt: { not: null } },
    select: { id: true, publishedAt: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/results`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...published.map((item) => ({
      url: `${base}/results/${item.id}`,
      lastModified: item.updatedAt ?? item.publishedAt ?? new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
