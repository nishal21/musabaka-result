import { prisma } from "@/lib/db";
import { PublicResultsHub } from "@/components/PublicResultsHub";

export const dynamic = "force-dynamic";

export default async function ResultsHubPage() {
  const items = await prisma.item.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { id: true, name: true, code: true },
  });
  return <PublicResultsHub items={items} />;
}
