import { prisma } from "@/lib/db";
import { NewItemClient } from "@/components/NewItemClient";

export default async function NewItemPage() {
  const judges = await prisma.judge.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return <NewItemClient judges={judges} />;
}
