import { notFound, redirect } from "next/navigation";
import { JudgeScoreClient } from "@/components/JudgeScoreClient";
import { getJudgeSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function JudgeScorePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const item = await prisma.item.findUnique({
    where: { privateToken: token },
    include: {
      participants: { orderBy: { slNo: "asc" }, include: { scores: true } },
      submissions: true,
    },
  });
  if (!item) notFound();

  const session = await getJudgeSession();
  if (!session || session.itemId !== item.id) {
    redirect(`/judge/${token}`);
  }

  const locked = Boolean(
    item.submissions.find((s) => s.judgeId === session.judgeId)?.submittedAt,
  );

  const initial = item.participants.map((p) => {
    const score = p.scores.find((s) => s.judgeId === session.judgeId);
    return {
      id: p.id,
      slNo: p.slNo,
      chestNo: p.chestNo,
      codeLetter: p.codeLetter,
      mark: score?.mark != null ? String(score.mark) : "",
      grade: score?.grade ?? "",
      remark: score?.remark ?? "",
    };
  });

  return (
    <JudgeScoreClient
      token={token}
      itemName={item.name}
      itemCode={item.code}
      judgeName={session.judgeName}
      locked={locked}
      initial={initial}
    />
  );
}
