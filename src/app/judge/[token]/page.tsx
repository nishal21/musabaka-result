import { notFound, redirect } from "next/navigation";
import { JudgeLoginClient } from "@/components/JudgeLoginClient";
import { getJudgeSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function JudgeGatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const item = await prisma.item.findUnique({
    where: { privateToken: token },
    include: { judge1: true, judge2: true },
  });
  if (!item) notFound();

  const session = await getJudgeSession();
  if (session && session.itemId === item.id) {
    redirect(`/judge/${token}/score`);
  }

  return (
    <JudgeLoginClient
      token={token}
      itemName={item.name}
      itemCode={item.code}
      judges={[
        { id: item.judge1.id, name: item.judge1.name },
        { id: item.judge2.id, name: item.judge2.name },
      ]}
    />
  );
}
