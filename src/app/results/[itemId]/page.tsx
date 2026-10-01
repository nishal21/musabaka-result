import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PlacementBoard } from "@/components/PlacementBoard";
import { EmptyState } from "@/components/ui/primitives";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ itemId: string }>;
}): Promise<Metadata> {
  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { name: true, code: true, publishedAt: true },
  });
  if (!item || !item.publishedAt) {
    return { title: "Result not available", robots: { index: false, follow: true } };
  }
  const title = `${item.name} placements`;
  const description = `Official ${SITE.name} placements for ${item.name} (${item.code}). Ranks only — marks are private.`;
  return {
    title,
    description,
    alternates: { canonical: `/results/${itemId}` },
    openGraph: {
      title: `${item.name} · ${SITE.name}`,
      description,
      url: `/results/${itemId}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} · ${SITE.name}`,
      description,
    },
  };
}

export default async function PublicItemResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ chest?: string | string[] }>;
}) {
  const { itemId } = await params;
  const { chest } = await searchParams;
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
      item={{ name: item.name, code: item.code, publishedAt: item.publishedAt.toISOString(), path: `/results/${item.id}` }}
      highlight={typeof chest === "string" ? chest : undefined}
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
