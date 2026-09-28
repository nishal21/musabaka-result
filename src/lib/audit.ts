import { prisma } from "@/lib/db";

export async function writeAudit(
  itemId: string,
  action: string,
  detail: Record<string, unknown>,
) {
  await prisma.resultAuditLog.create({
    data: {
      itemId,
      action,
      detail: JSON.stringify(detail),
    },
  });
}
