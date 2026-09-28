import { notFound } from "next/navigation";
import { ResultsClient } from "@/components/ResultsClient";
import { prisma } from "@/lib/db";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      judge1: true,
      judge2: true,
      participants: {
        orderBy: { slNo: "asc" },
        include: { scores: true },
      },
      submissions: true,
      auditLogs: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
  if (!item) notFound();

  const j1Sub = item.submissions.find((s) => s.judgeId === item.judge1Id);
  const j2Sub = item.submissions.find((s) => s.judgeId === item.judge2Id);

  const rows = item.participants.map((p) => {
    const s1 = p.scores.find((s) => s.judgeId === item.judge1Id);
    const s2 = p.scores.find((s) => s.judgeId === item.judge2Id);
    return {
      id: p.id,
      slNo: p.slNo,
      chestNo: p.chestNo,
      codeLetter: p.codeLetter,
      placement: p.placement,
      j1Mark: s1?.mark ?? null,
      j2Mark: s2?.mark ?? null,
      j1Grade: s1?.grade ?? null,
      j2Grade: s2?.grade ?? null,
      j1Remark: s1?.remark ?? null,
      j2Remark: s2?.remark ?? null,
    };
  });

  return (
    <ResultsClient
      item={{
        id: item.id,
        name: item.name,
        code: item.code,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      }}
      rows={rows}
      judge1={{ id: item.judge1.id, name: item.judge1.name }}
      judge2={{ id: item.judge2.id, name: item.judge2.name }}
      j1Submitted={Boolean(j1Sub?.submittedAt)}
      j2Submitted={Boolean(j2Sub?.submittedAt)}
      audits={item.auditLogs.map((a) => ({
        id: a.id,
        action: a.action,
        createdAt: a.createdAt.toISOString(),
        detail: a.detail,
      }))}
    />
  );
}
