import { notFound } from "next/navigation";
import { ParticipantsClient } from "@/components/ParticipantsClient";
import { prisma } from "@/lib/db";
import { judgeLink } from "@/lib/utils";

export default async function ParticipantsPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      participants: { orderBy: { slNo: "asc" } },
    },
  });
  if (!item) notFound();
  return (
    <ParticipantsClient
      item={{ id: item.id, name: item.name, code: item.code }}
      participants={item.participants}
      judgeUrl={judgeLink(item.privateToken)}
    />
  );
}
