import { notFound } from "next/navigation";
import { PlacementBoard } from "@/components/PlacementBoard";
import { EmptyState } from "@/components/ui/primitives";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function PublicItemResultsPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      participants: {
        where: { placement: { not: null } },
        orderBy: { placement: "asc" },
      },
    },
  });
  if (!item) notFound();
  if (!item.publishedAt) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="Not published"
          body="This item’s results are not public yet."
          action={
            <Link href="/results" className="text-brand-blue">
              Back to results
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <PlacementBoard
      item={{ name: item.name, code: item.code }}
      rows={item.participants
        .filter((p) => p.placement != null)
        .map((p) => ({
          placement: p.placement as number,
          chestNo: p.chestNo,
          codeLetter: p.codeLetter,
        }))}
    />
  );
}
