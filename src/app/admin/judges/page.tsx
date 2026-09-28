import { prisma } from "@/lib/db";
import { JudgesClient } from "@/components/JudgesClient";

export default async function JudgesPage() {
  const judges = await prisma.judge.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return <JudgesClient judges={judges} />;
}
